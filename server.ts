import express from "express";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import * as archiver from "archiver";
import AdmZip from 'adm-zip';
import dns from "dns";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, deleteDoc, updateDoc, initializeFirestore } from "firebase/firestore";

// Set DNS default resolution order to IPv4 first to prevent getaddrinfo ENOTFOUND on IPv4-only domains (like steadfast.com.bd) in environments supporting IPv6
if (dns && dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

// Global DNS lookup monkey-patch to query public resolvers (1.1.1.1, 8.8.8.8) if the hosting server's default DNS is broken
if (dns && dns.lookup) {
  const originalLookup = dns.lookup;
  // @ts-ignore
  dns.lookup = function(hostname, options, callback) {
    let actualCallback = callback;
    let actualOptions = options;
    if (typeof options === "function") {
      actualCallback = options;
      actualOptions = {};
    }

    originalLookup(hostname, actualOptions, (err, address, family) => {
      if (!err) {
        if (actualCallback) actualCallback(null, address, family);
        return;
      }

      const hostStr = String(hostname || "");
      if (!hostStr.includes("steadfast.com.bd") && !hostStr.includes("packzy.com")) {
        if (actualCallback) actualCallback(err, address, family);
        return;
      }

      console.warn(`[DNS Fallback] Native lookup failed for ${hostStr}: ${err.message}. Retrying via Public DNS (1.1.1.1/8.8.8.8)...`);

      try {
        const resolver = new dns.Resolver();
        resolver.setServers(["1.1.1.1", "8.8.8.8", "9.9.9.9"]);
        resolver.resolve4(hostStr, (dnsErr, addresses) => {
          if (dnsErr || !addresses || addresses.length === 0) {
            console.error(`[DNS Fallback] Public DNS resolution also failed for ${hostStr}:`, dnsErr);
            if (actualCallback) actualCallback(err, address, family);
          } else {
            console.log(`[DNS Fallback] Public DNS successfully resolved ${hostStr} to ${addresses[0]}`);
            if (actualCallback) actualCallback(null, addresses[0], 4);
          }
        });
      } catch (fallbackErr) {
        console.error(`[DNS Fallback] Resolver execution failed:`, fallbackErr);
        if (actualCallback) actualCallback(err, address, family);
      }
    });
  };
}

console.log("Server script executed!");

// Initialize Firebase from config
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
let db: any = null;

if (fs.existsSync(firebaseConfigPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
    const firebaseApp = initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId
    });
    
    if (config.firestoreDatabaseId) {
      db = initializeFirestore(firebaseApp, { experimentalForceLongPolling: true }, config.firestoreDatabaseId);
      console.log(`[Firebase] Initialized with custom database ID: ${config.firestoreDatabaseId}`);
    } else {
      db = initializeFirestore(firebaseApp, { experimentalForceLongPolling: true });
      console.log("[Firebase] Initialized with default database ID");
    }
  } catch (err) {
    console.error("[Firebase] Initialization failed:", err);
  }
} else {
  console.warn("[Firebase] Config file not found. Falling back to local files.");
}

const app = express();
const PORT = 3000;

  // Prevent caching for API routes
  app.use("/api", (req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

// Use JSON parsing middleware
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));

// API Route: Facebook Conversions API (CAPI) Proxy
  app.post("/api/fb-capi/track", async (req, res) => {
    const { pixelId, pixelAccessToken, event_name, event_source_url, user_data, custom_data } = req.body;

    if (!pixelId || !pixelAccessToken || !event_name) {
      return res.status(400).json({ status: 400, message: "pixelId, pixelAccessToken, and event_name are required." });
    }

    try {
      const client_ip = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "").split(",")[0].trim();
      const client_ua = req.headers["user-agent"] || "";

      const formatted_user_data: any = {};
      if (user_data) {
        // Keep existing client info if provided
        if (user_data.client_ip_address) formatted_user_data.client_ip_address = user_data.client_ip_address;
        if (user_data.client_user_agent) formatted_user_data.client_user_agent = user_data.client_user_agent;

        // Auto-format and SHA-256 hash phone numbers (ph) as required by Meta Specs
        if (user_data.ph) {
          const phArray = Array.isArray(user_data.ph) ? user_data.ph : [user_data.ph];
          formatted_user_data.ph = phArray.map((p: string) => {
            const clean = p.replace(/[^0-9]/g, "");
            // Standardize BD phone numbers to country code format (8801...)
            const finalPh = clean.startsWith("88") ? clean : (clean.startsWith("0") ? "88" + clean : clean);
            return crypto.createHash("sha256").update(finalPh).digest("hex");
          });
        }

        // Auto-format and SHA-256 hash emails (em)
        if (user_data.em) {
          const emArray = Array.isArray(user_data.em) ? user_data.em : [user_data.em];
          formatted_user_data.em = emArray.map((e: string) => 
            crypto.createHash("sha256").update(e.trim().toLowerCase()).digest("hex")
          );
        }

        // Auto-format and SHA-256 hash first name (fn)
        if (user_data.fn) {
          const fnArray = Array.isArray(user_data.fn) ? user_data.fn : [user_data.fn];
          formatted_user_data.fn = fnArray.map((f: string) => 
            crypto.createHash("sha256").update(f.trim().toLowerCase()).digest("hex")
          );
        }

        // Copy other custom user fields as-is
        for (const key of Object.keys(user_data)) {
          if (!["ph", "em", "fn", "ln", "client_ip_address", "client_user_agent"].includes(key)) {
            formatted_user_data[key] = user_data[key];
          }
        }
      }

      // Fill in IP & UA from backend headers for accurate matching
      formatted_user_data.client_ip_address = formatted_user_data.client_ip_address || client_ip;
      formatted_user_data.client_user_agent = formatted_user_data.client_user_agent || client_ua;

      const source_url = event_source_url || req.headers.referer || "";

      const capiPayload = {
        data: [
          {
            event_name,
            event_time: Math.floor(Date.now() / 1000),
            action_source: "website",
            event_source_url: source_url,
            user_data: formatted_user_data,
            custom_data: custom_data || {}
          }
        ]
      };

      console.log(`Sending Meta CAPI event: ${event_name} for Pixel: ${pixelId}`);
      const response = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${pixelAccessToken}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(capiPayload),
      });

      const data = await response.json();
      console.log(`Meta CAPI Response for ${event_name}:`, data);
      return res.status(response.status).json(data);
    } catch (error: any) {
      console.error(`Error sending Meta CAPI event ${event_name}:`, error);
      return res.status(500).json({ status: 500, message: "Failed to send event to Facebook Conversions API.", error: error.message });
    }
  });

  // API Route: Create Steadfast Order Proxy
  app.post("/api/steadfast/create_order", async (req, res) => {
    const { apiKey, secretKey, payload } = req.body;

    if (!apiKey || !secretKey) {
      return res.status(400).json({ status: 400, message: "API-Key and Secret-Key are required." });
    }

    let triedPackzy = false;
    let lastErrorMsg = "";

    try {
      console.log("Proxying create_order to Steadfast API (steadfast.com.bd) with payload:", payload);
      let response = await fetch("https://portal.steadfast.com.bd/api/v1/create_order", {
        method: "POST",
        headers: {
          "Api-Key": apiKey,
          "Secret-Key": secretKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (jsonErr) {
        console.error("Steadfast API returned non-JSON response from steadfast.com.bd:", responseText);
        lastErrorMsg = `steadfast.com.bd non-JSON response (${response.status})`;
      }

      // If steadfast.com.bd failed or returned error, try portal.packzy.com as automatic fallback
      const isSuccess = response.ok && responseData && (responseData.status === 200 || responseData.consignment);
      if (!isSuccess) {
        console.log("steadfast.com.bd order failed or returned error. Retrying on portal.packzy.com...");
        triedPackzy = true;
        const fallbackResponse = await fetch("https://portal.packzy.com/api/v1/create_order", {
          method: "POST",
          headers: {
            "Api-Key": apiKey,
            "Secret-Key": secretKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const fallbackText = await fallbackResponse.text();
        try {
          responseData = JSON.parse(fallbackText);
          response = fallbackResponse; // use fallback response
        } catch (jsonErr) {
          console.error("Steadfast API returned non-JSON response from packzy.com:", fallbackText);
          lastErrorMsg = `packzy.com non-JSON response (${fallbackResponse.status})`;
        }
      }

      if (!responseData) {
        return res.status(200).json({
          status: response.status,
          message: `Steadfast API returned non-JSON response. ${lastErrorMsg}`,
        });
      }

      console.log("Steadfast API Final Response (Tried Packzy:", triedPackzy, "):", responseData);
      return res.status(200).json(responseData);
    } catch (error: any) {
      console.log("Steadfast API unreachable, trying packzy.com...", error.message);
      if (!triedPackzy) {
        try {
          const fallbackResponse = await fetch("https://portal.packzy.com/api/v1/create_order", {
            method: "POST",
            headers: {
              "Api-Key": apiKey,
              "Secret-Key": secretKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          const fallbackText = await fallbackResponse.text();
          const responseData = JSON.parse(fallbackText);
          console.log("Steadfast API Packzy Fallback response after throw:", responseData);
          return res.status(200).json(responseData);
        } catch (fbErr: any) {
          console.log("Packzy fallback also failed:", fbErr.message);
        }
      }
      return res.status(200).json({ status: 500, message: "Failed to connect to Steadfast Courier server.", error: error.message });
    }
  });

  // API Route: Get Steadfast Balance Proxy
  app.get("/api/steadfast/get_balance", async (req, res) => {
    const apiKey = (req.headers["api-key"] || req.query.apiKey) as string;
    const secretKey = (req.headers["secret-key"] || req.query.secretKey) as string;

    if (!apiKey || !secretKey) {
      return res.status(400).json({ status: 400, message: "Api-Key and Secret-Key headers are required." });
    }

    let triedPackzy = false;

    try {
      console.log("Proxying get_balance to Steadfast API (steadfast.com.bd)...");
      let response = await fetch("https://portal.steadfast.com.bd/api/v1/get_balance", {
        method: "GET",
        headers: {
          "Api-Key": apiKey,
          "Secret-Key": secretKey,
        },
      });

      let responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (jsonErr) {
        console.error("Steadfast Balance API returned non-JSON response from steadfast.com.bd:", responseText);
      }

      const isSuccess = response.ok && responseData && (responseData.status === 200 || responseData.current_balance !== undefined);
      if (!isSuccess) {
        console.log("steadfast.com.bd balance failed. Retrying on portal.packzy.com...");
        triedPackzy = true;
        const fallbackResponse = await fetch("https://portal.packzy.com/api/v1/get_balance", {
          method: "GET",
          headers: {
            "Api-Key": apiKey,
            "Secret-Key": secretKey,
          },
        });

        const fallbackText = await fallbackResponse.text();
        try {
          responseData = JSON.parse(fallbackText);
          response = fallbackResponse;
        } catch (jsonErr) {
          console.error("Steadfast Balance API returned non-JSON response from packzy.com:", fallbackText);
        }
      }

      if (!responseData) {
        return res.status(200).json({
          status: response.status,
          message: "Steadfast API returned non-JSON response.",
        });
      }

      console.log("Steadfast Balance API Final Response (Tried Packzy:", triedPackzy, "):", responseData);
      return res.status(200).json(responseData);
    } catch (error: any) {
      console.log("Steadfast Balance API unreachable, trying packzy.com...", error.message);
      if (!triedPackzy) {
        try {
          const fallbackResponse = await fetch("https://portal.packzy.com/api/v1/get_balance", {
            method: "GET",
            headers: {
              "Api-Key": apiKey,
              "Secret-Key": secretKey,
            },
          });
          const fallbackText = await fallbackResponse.text();
          const responseData = JSON.parse(fallbackText);
          console.log("Steadfast Balance API Packzy Fallback response after throw:", responseData);
          return res.status(200).json(responseData);
        } catch (fbErr: any) {
          console.log("Packzy balance fallback failed:", fbErr.message);
        }
      }
      return res.status(200).json({ status: 500, message: "Failed to connect to Steadfast Courier server.", error: error.message });
    }
  });

  // API Route: Get Steadfast Fraud Check / Phone Recipient History Proxy
  app.get("/api/steadfast/fraud_check/:phone", async (req, res) => {
    const { phone } = req.params;
    const apiKey = (req.headers["api-key"] || req.query.apiKey) as string;
    const secretKey = (req.headers["secret-key"] || req.query.secretKey) as string;

    if (!apiKey || !secretKey) {
      return res.status(400).json({ status: 400, message: "Api-Key and Secret-Key headers are required." });
    }

    let triedPackzy = false;

    try {
      console.log(`Proxying fraud_check for phone ${phone} to Steadfast API (steadfast.com.bd)...`);
      let response = await fetch(`https://portal.steadfast.com.bd/api/v1/fraud_check/${phone}`, {
        method: "GET",
        headers: {
          "Api-Key": apiKey,
          "Secret-Key": secretKey,
        },
      });

      let responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (jsonErr) {
        console.error("Steadfast Fraud Check API returned non-JSON response from steadfast.com.bd:", responseText);
      }

      const isSuccess = response.ok && responseData && (responseData.status === 200 || responseData.total_parcel !== undefined);
      if (!isSuccess) {
        console.log("steadfast.com.bd fraud check failed. Retrying on portal.packzy.com...");
        triedPackzy = true;
        const fallbackResponse = await fetch(`https://portal.packzy.com/api/v1/fraud_check/${phone}`, {
          method: "GET",
          headers: {
            "Api-Key": apiKey,
            "Secret-Key": secretKey,
          },
        });

        const fallbackText = await fallbackResponse.text();
        try {
          responseData = JSON.parse(fallbackText);
          response = fallbackResponse;
        } catch (jsonErr) {
          console.error("Steadfast Fraud Check API returned non-JSON response from packzy.com:", fallbackText);
        }
      }

      if (!responseData) {
        return res.status(200).json({
          status: response.status,
          message: "Steadfast API returned non-JSON response.",
        });
      }

      console.log("Steadfast Fraud Check API Final Response (Tried Packzy:", triedPackzy, "):", responseData);
      return res.status(200).json(responseData);
    } catch (error: any) {
      console.log("Steadfast Fraud Check API unreachable, trying packzy.com...", error.message);
      if (!triedPackzy) {
        try {
          const fallbackResponse = await fetch(`https://portal.packzy.com/api/v1/fraud_check/${phone}`, {
            method: "GET",
            headers: {
              "Api-Key": apiKey,
              "Secret-Key": secretKey,
            },
          });
          const fallbackText = await fallbackResponse.text();
          const responseData = JSON.parse(fallbackText);
          console.log("Steadfast Fraud Check API Packzy Fallback response after throw:", responseData);
          return res.status(200).json(responseData);
        } catch (fbErr: any) {
          console.log("Packzy fraud check fallback failed:", fbErr.message);
        }
      }
      return res.status(200).json({ status: 500, message: "Failed to connect to Steadfast Courier server.", error: error.message });
    }
  });

  // API Route: Download Namecheap & cPanel Deployment ZIP Package dynamically
  app.get(["/api/download-package", "/api/export/namecheap-zip", "/namecheap-ready.zip"], async (req, res) => {
    try {
      const zip = new AdmZip();
      const cwd = process.cwd();

      // READMEs
      const readmeText = `========================================================================
Shoker ghor SHOP - NAMECHEAP & cPANEL DEPLOYMENT GUIDE (বাংলা ও ইংরেজি নির্দেশনা)
========================================================================

আপনার ই-কমার্স ওয়েবসাইটটি Namecheap বা যেকোনো cPanel হোস্টিংয়ে খুব সহজেই ২ পদ্ধতিতে চালাতে পারবেন:

------------------------------------------------------------------------
পদ্ধতি ১: সাধারণ স্ট্যাটিক হোস্টিং (সবচেয়ে সহজ ও দ্রুত - public_html)
------------------------------------------------------------------------
১. আপনার কম্পিউটারে এই প্রজেক্ট ফোল্ডারে টার্মিনাল/সিএমডি ওপেন করে লিখুন:
   npm install
   npm run build
২. build সম্পন্ন হলে দেখবেন "dist" নামের একটি ফোল্ডার তৈরি হয়েছে।
৩. আপনার Namecheap cPanel-এ লগইন করে File Manager -> public_html ফোল্ডারে যান।
৪. "dist" ফোল্ডারের ভেতরের সমস্ত ফাইল (index.html, assets ফোল্ডার ইত্যাদি) এবং এই জিপে থাকা ".htaccess" ফাইলটি public_html ফোল্ডারে আপলোড করুন।
৫. ব্যস! আপনার ওয়েবসাইট লাইভ হয়ে যাবে এবং যেকোনো পেজে রিফ্রেশ করলেও 404 এরর আসবে না।

------------------------------------------------------------------------
পদ্ধতি ২: cPanel Node.js Selector (ফুল-স্ট্যাক / API সহ চালনার জন্য)
------------------------------------------------------------------------
১. cPanel থেকে "Setup Node.js App" বা "Node.js Selector" অপশনে যান।
২. Create Application এ ক্লিক করে Node.js version 18 বা 20 সিলেক্ট করুন।
৩. Application root ফোল্ডারের নাম দিন (যেমন: Shoker ghorshop) এবং Application Startup File হিসেবে লিখুন:
   app.js
৪. Create বাটনে ক্লিক করুন।
৫. এবার File Manager দিয়ে আপনার তৈরি করা ফোল্ডারে এই জিপের সমস্ত ফাইল আপলোড করুন।
۶. cPanel Node.js অ্যাপ প্যানেলে ফিরে গিয়ে "Run NPM Install" বাটনে ক্লিক করুন।
৭. এরপর "Restart" বাটনে ক্লিক করুন। আপনার ওয়েবসাইট এবং সার্ভার API সম্পূর্ণ চালু হয়ে যাবে!

যেকোনো প্রয়োজনে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।
ধন্যবাদ!
`;
      zip.addFile("README_NAMECHEAP_CPANEL_BN.txt", Buffer.from(readmeText));
      zip.addFile("HOW_TO_DEPLOY_BN.txt", Buffer.from(readmeText));

      // .htaccess
      const htaccessContent = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Optional: Enable Gzip Compression for Namecheap
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
`;
      zip.addFile(".htaccess", Buffer.from(htaccessContent));
      zip.addFile("public/.htaccess", Buffer.from(htaccessContent));

      // app.js startup
      const appJsContent = `// Namecheap cPanel Node.js Startup File
try {
  // Use the pre-compiled production code for extremely low memory usage and high performance on shared cPanel hosting
  require('./dist/server.cjs');
} catch (e) {
  console.log("Pre-compiled bundle './dist/server.cjs' not found, falling back to runtime compilation with ts-node...");
  try {
    require('ts-node/register');
    require('./server.ts');
  } catch (err) {
    console.error("Failed to start the application. Please ensure you run 'npm run build' or check dependencies.");
    throw err;
  }
}
`;
      zip.addFile("app.js", Buffer.from(appJsContent));

      // Root files
      const filesToInclude = [
        "package.json", "tsconfig.json", "vite.config.ts", "index.html",
        "server.ts", "postcss.config.js", "tailwind.config.js", ".env.example", "README.md"
      ];
      for (const file of filesToInclude) {
        if (fs.existsSync(path.join(cwd, file))) {
          zip.addLocalFile(path.join(cwd, file));
        }
      }

      // Directories
      if (fs.existsSync(path.join(cwd, "src"))) zip.addLocalFolder(path.join(cwd, "src"), "src");
      if (fs.existsSync(path.join(cwd, "public"))) zip.addLocalFolder(path.join(cwd, "public"), "public");

      const buffer = zip.toBuffer();
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", 'attachment; filename="Shoker ghorShop-Namecheap-cPanel-Deployment-Package.zip"');
      res.send(buffer);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error");
    }
  });

  // Server-side database for Landing Pages
  const LANDING_PAGES_FILE = path.join(process.cwd(), "landing_pages_db.json");

  const DEFAULT_LANDING_PAGES = [
    {
      id: 'lp-1',
      slug: 'summer-cotton-special',
      title: 'Summer Cotton Special Offer',
      productId: 'led-high-tops-copy-copy',
      bannerImage: 'https://cdn.shopify.com/s/files/1/0712/1820/0746/files/Generated_Image_January_25_2026_-_7_56PM.png?v=1780922542',
      headline: 'এক্সক্লুসিভ সামার কটন কালেকশন ২০২৬',
      subheadline: 'শহরের সেরা আরামদায়ক ও প্রিমিয়াম কোয়ালিটি পাঞ্জাবি। সীমিত সময়ের জন্য বিশেষ ডিসকাউন্ট!',
      badgeText: '☀️ SUMMER COTTON SPECIAL',
      discountPrice: 999,
      features: ['১০০% প্রিমিয়াম সুতি কাপড়', 'অরিজিনাল এম্ব্রয়ডারি ডিজাইন', 'ক্যাশ অন ডেলিভারি সুবিধা', 'সারা দেশে দ্রুত হোম ডেলিভারি'],
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'lp-2',
      slug: 'indian-katan-special',
      title: 'Indian Katan Premium Offer',
      productId: 'led-high-tops-copy-copy-copy',
      bannerImage: 'https://cdn.shopify.com/s/files/1/0712/1820/0746/files/GeneratedImageDecember11_2025-9_24PM_1_1_0a4aaf81-51b5-4c82-a4c6-c28720493b07.png?v=1780922516',
      headline: 'প্রিমিয়াম সিকুয়েন্স এম্বোটারি পাঞ্জাবি',
      subheadline: 'ইন্ডিয়ান কাতান কাপড়ের প্রিমিয়াম স্নাব বাটন পাঞ্জাবি। রাজকীয় আভিজাত্য ও আধুনিক ফ্যাশনের অনন্য মেলবন্ধন!',
      badgeText: '👑 INDIKAN KATAN EXCLUSIVE',
      discountPrice: 1450,
      features: ['প্রিমিয়াম সিকুয়েন্স এম্বোটারি ডিজাইন', '১০০% অরিজিনাল ইন্ডিয়ান কাতান', 'প্রিমিয়াম স্নাব মেটাল বাটন', 'সারা দেশে ক্যাশ অন ডেলিভারি'],
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];

  function getStoredLandingPages() {
    try {
      if (!fs.existsSync(LANDING_PAGES_FILE)) {
        fs.writeFileSync(LANDING_PAGES_FILE, JSON.stringify(DEFAULT_LANDING_PAGES, null, 2), "utf-8");
        return DEFAULT_LANDING_PAGES;
      }
      const data = fs.readFileSync(LANDING_PAGES_FILE, "utf-8");
      return JSON.parse(data);
    } catch (err) {
      console.error("Error reading landing pages file:", err);
    }
    return DEFAULT_LANDING_PAGES;
  }

  function saveStoredLandingPages(pages: any[]) {
    try {
      fs.writeFileSync(LANDING_PAGES_FILE, JSON.stringify(pages, null, 2), "utf-8");
      return true;
    } catch (err) {
      console.error("Error writing landing pages file:", err);
      return false;
    }
  }

  // API Route: Get all landing pages
  app.get("/api/landing-pages", async (req, res) => {
    try {
      if (db) {
        const snapshot = await getDocs(collection(db, "landing_pages"));
        if (!snapshot.empty) {
          const pages = snapshot.docs.map(doc => doc.data());
          return res.json(pages);
        }
      }
      const data = fs.existsSync(LANDING_PAGES_FILE) ? JSON.parse(fs.readFileSync(LANDING_PAGES_FILE, "utf-8")) : DEFAULT_LANDING_PAGES;
      res.json(data);
    } catch (err: any) {
      console.error("Error getting landing pages:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // API Route: Save/update a landing page
  app.post("/api/landing-pages", async (req, res) => {
    try {
      const page = req.body;
      if (!page || !page.id || !page.slug) {
        return res.status(400).json({ status: 400, message: "Valid landing page with id and slug is required." });
      }

      // Save to local file
      let pages = [];
      try {
        if (fs.existsSync(LANDING_PAGES_FILE)) {
          pages = JSON.parse(fs.readFileSync(LANDING_PAGES_FILE, "utf-8"));
        }
      } catch (e) {}
      const existingIndex = pages.findIndex((p: any) => p.id === page.id);
      if (existingIndex !== -1) {
        pages[existingIndex] = { ...pages[existingIndex], ...page };
      } else {
        pages.unshift(page);
      }
      fs.writeFileSync(LANDING_PAGES_FILE, JSON.stringify(pages, null, 2), "utf-8");

      // Save to Firestore if available
      if (db) {
        await setDoc(doc(db, "landing_pages", String(page.id)), page);
      }

      res.json({ status: 200, message: "Landing page saved successfully on server and cloud.", page });
    } catch (err: any) {
      console.error("Error saving landing page:", err);
      res.status(500).json({ status: 500, message: err.message });
    }
  });

  // API Route: Delete a landing page
  app.delete("/api/landing-pages/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ status: 400, message: "Landing page ID is required." });
      }

      let pages = [];
      try {
        if (fs.existsSync(LANDING_PAGES_FILE)) {
          pages = JSON.parse(fs.readFileSync(LANDING_PAGES_FILE, "utf-8"));
        }
      } catch (e) {}
      const filtered = pages.filter((p: any) => p.id !== id);
      fs.writeFileSync(LANDING_PAGES_FILE, JSON.stringify(filtered, null, 2), "utf-8");

      if (db) {
        await deleteDoc(doc(db, "landing_pages", String(id)));
      }

      res.json({ status: 200, message: "Landing page deleted successfully from server and cloud." });
    } catch (err: any) {
      console.error("Error deleting landing page:", err);
      res.status(500).json({ status: 500, message: err.message });
    }
  });

  // Server-side database for Products
  const PRODUCTS_FILE = path.join(process.cwd(), "products_db.json");

  // API Route: Get all products
  app.get("/api/products", async (req, res) => {
    try {
      if (db) {
        const snapshot = await getDocs(collection(db, "products"));
        if (!snapshot.empty) {
          const products = snapshot.docs.map(doc => doc.data());
          return res.json(products);
        }
      }
      if (!fs.existsSync(PRODUCTS_FILE)) {
        const { INITIAL_PRODUCTS } = require("./src/data");
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(INITIAL_PRODUCTS, null, 2), "utf-8");
        return res.json(INITIAL_PRODUCTS);
      }
      const data = fs.readFileSync(PRODUCTS_FILE, "utf-8");
      res.json(JSON.parse(data));
    } catch (err: any) {
      console.error("Error getting products:", err);
      try {
        const { INITIAL_PRODUCTS } = require("./src/data");
        res.json(INITIAL_PRODUCTS);
      } catch (e) {
        res.status(500).json({ error: err.message });
      }
    }
  });

  // API Route: Save/update a product
  app.post("/api/products", async (req, res) => {
    try {
      const product = req.body;
      if (!product || !product.id) {
        return res.status(400).json({ status: 400, message: "Valid product with id is required." });
      }

      let products = [];
      try {
        if (fs.existsSync(PRODUCTS_FILE)) {
          products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf-8"));
        } else {
          const { INITIAL_PRODUCTS } = require("./src/data");
          products = INITIAL_PRODUCTS;
        }
      } catch (e) {
        const { INITIAL_PRODUCTS } = require("./src/data");
        products = INITIAL_PRODUCTS;
      }

      const existingIndex = products.findIndex((p: any) => p.id === product.id);
      if (existingIndex !== -1) {
        products[existingIndex] = { ...products[existingIndex], ...product };
      } else {
        products.unshift(product);
      }
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");

      if (db) {
        try {
          await setDoc(doc(db, "products", String(product.id)), product);
        } catch (dbErr) {
          console.warn("Failed to save to Firestore (possibly too large), but saved locally.", dbErr);
        }
      }

      res.json({ status: 200, message: "Product saved successfully on server and cloud.", product });
    } catch (err: any) {
      console.error("Error saving product:", err);
      res.status(500).json({ status: 500, message: err.message });
    }
  });

  // API Route: Delete a product
  app.delete("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ status: 400, message: "Product ID is required." });
      }

      let products = [];
      try {
        if (fs.existsSync(PRODUCTS_FILE)) {
          products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf-8"));
        }
      } catch (e) {}

      const filtered = products.filter((p: any) => p.id !== id);
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(filtered, null, 2), "utf-8");

      if (db) {
        await deleteDoc(doc(db, "products", String(id)));
      }

      res.json({ status: 200, message: "Product deleted successfully from server and cloud." });
    } catch (err: any) {
      console.error("Error deleting product:", err);
      res.status(500).json({ status: 500, message: err.message });
    }
  });

  // Server-side database files for Orders and Drafts
  const ORDERS_FILE = path.join(process.cwd(), "orders_db.json");
  const INCOMPLETE_ORDERS_FILE = path.join(process.cwd(), "incomplete_orders_db.json");

  // API Route: Get all orders
  app.get("/api/orders", async (req, res) => {
    try {
      let orders = [];
      // Try local file first as primary or backup
      if (fs.existsSync(ORDERS_FILE)) {
        try {
          const fileData = fs.readFileSync(ORDERS_FILE, "utf-8");
          orders = JSON.parse(fileData);
        } catch (e) {
          console.error("Error reading orders file:", e);
        }
      }

      // Sync from Firestore if available and empty or to fetch fresh
      if (db) {
        try {
          const querySnapshot = await getDocs(collection(db, "orders"));
          const cloudOrders: any[] = [];
          querySnapshot.forEach((docSnap) => {
            cloudOrders.push(docSnap.data());
          });
          if (cloudOrders.length > 0) {
            orders = cloudOrders;
            // Backup to local file
            fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
          }
        } catch (dbErr) {
          console.warn("Failed to fetch orders from Firestore, using local backup:", dbErr);
        }
      }

      // Sort by date descending
      orders.sort((a: any, b: any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      res.json(orders);
    } catch (err: any) {
      console.error("Error getting orders:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // API Route: Save/Update an order
  app.post("/api/orders", async (req, res) => {
    try {
      const order = req.body;
      if (!order || !order.id) {
        return res.status(400).json({ status: 400, message: "Valid order object with id is required." });
      }

      let orders = [];
      try {
        if (fs.existsSync(ORDERS_FILE)) {
          orders = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf-8"));
        }
      } catch (e) {}

      const existingIndex = orders.findIndex((o: any) => o.id === order.id);
      if (existingIndex !== -1) {
        orders[existingIndex] = { ...orders[existingIndex], ...order };
      } else {
        orders.unshift(order);
      }
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");

      if (db) {
        try {
          await setDoc(doc(db, "orders", String(order.id)), order, { merge: true });
        } catch (dbErr) {
          console.warn("Failed to save order to Firestore, but saved locally:", dbErr);
        }
      }

      res.json({ status: 200, message: "Order saved successfully on server and cloud.", order });
    } catch (err: any) {
      console.error("Error saving order:", err);
      res.status(500).json({ status: 500, message: err.message });
    }
  });

  // API Route: Delete an order
  app.delete("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ status: 400, message: "Order ID is required." });
      }

      let orders = [];
      try {
        if (fs.existsSync(ORDERS_FILE)) {
          orders = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf-8"));
        }
      } catch (e) {}

      const filtered = orders.filter((o: any) => o.id !== id);
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(filtered, null, 2), "utf-8");

      if (db) {
        try {
          await deleteDoc(doc(db, "orders", String(id)));
        } catch (dbErr) {
          console.warn("Failed to delete order from Firestore, deleted locally:", dbErr);
        }
      }

      res.json({ status: 200, message: "Order deleted successfully from server and cloud." });
    } catch (err: any) {
      console.error("Error deleting order:", err);
      res.status(500).json({ status: 500, message: err.message });
    }
  });

  // API Route: Get all incomplete orders
  app.get("/api/incomplete-orders", async (req, res) => {
    try {
      let drafts = [];
      if (fs.existsSync(INCOMPLETE_ORDERS_FILE)) {
        try {
          const fileData = fs.readFileSync(INCOMPLETE_ORDERS_FILE, "utf-8");
          drafts = JSON.parse(fileData);
        } catch (e) {
          console.error("Error reading incomplete orders file:", e);
        }
      }

      if (db) {
        try {
          const querySnapshot = await getDocs(collection(db, "incompleteOrders"));
          const cloudDrafts: any[] = [];
          querySnapshot.forEach((docSnap) => {
            cloudDrafts.push(docSnap.data());
          });
          if (cloudDrafts.length > 0) {
            drafts = cloudDrafts;
            fs.writeFileSync(INCOMPLETE_ORDERS_FILE, JSON.stringify(drafts, null, 2), "utf-8");
          }
        } catch (dbErr) {
          console.warn("Failed to fetch drafts from Firestore, using local backup:", dbErr);
        }
      }

      drafts.sort((a: any, b: any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      res.json(drafts);
    } catch (err: any) {
      console.error("Error getting incomplete orders:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // API Route: Save/Update an incomplete order
  app.post("/api/incomplete-orders", async (req, res) => {
    try {
      const draft = req.body;
      if (!draft || !draft.id) {
        return res.status(400).json({ status: 400, message: "Valid draft object with id is required." });
      }

      let drafts = [];
      try {
        if (fs.existsSync(INCOMPLETE_ORDERS_FILE)) {
          drafts = JSON.parse(fs.readFileSync(INCOMPLETE_ORDERS_FILE, "utf-8"));
        }
      } catch (e) {}

      const existingIndex = drafts.findIndex((d: any) => d.id === draft.id);
      if (existingIndex !== -1) {
        drafts[existingIndex] = { ...drafts[existingIndex], ...draft };
      } else {
        drafts.unshift(draft);
      }
      fs.writeFileSync(INCOMPLETE_ORDERS_FILE, JSON.stringify(drafts, null, 2), "utf-8");

      if (db) {
        try {
          await setDoc(doc(db, "incompleteOrders", String(draft.id)), draft, { merge: true });
        } catch (dbErr) {
          console.warn("Failed to save draft to Firestore, but saved locally:", dbErr);
        }
      }

      res.json({ status: 200, message: "Draft saved successfully on server and cloud.", draft });
    } catch (err: any) {
      console.error("Error saving draft:", err);
      res.status(500).json({ status: 500, message: err.message });
    }
  });

  // API Route: Delete an incomplete order
  app.delete("/api/incomplete-orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ status: 400, message: "Draft ID is required." });
      }

      let drafts = [];
      try {
        if (fs.existsSync(INCOMPLETE_ORDERS_FILE)) {
          drafts = JSON.parse(fs.readFileSync(INCOMPLETE_ORDERS_FILE, "utf-8"));
        }
      } catch (e) {}

      const filtered = drafts.filter((d: any) => d.id !== id);
      fs.writeFileSync(INCOMPLETE_ORDERS_FILE, JSON.stringify(filtered, null, 2), "utf-8");

      if (db) {
        try {
          await deleteDoc(doc(db, "incompleteOrders", String(id)));
        } catch (dbErr) {
          console.warn("Failed to delete draft from Firestore, deleted locally:", dbErr);
        }
      }

      res.json({ status: 200, message: "Draft deleted successfully from server and cloud." });
    } catch (err: any) {
      console.error("Error deleting draft:", err);
      res.status(500).json({ status: 500, message: err.message });
    }
  });

  // Server-side database for Settings
  const SETTINGS_FILE = path.join(process.cwd(), "settings_db.json");

  // API Route: Get store settings
  app.get("/api/settings", async (req, res) => {
    try {
      if (db) {
        const docSnap = await getDoc(doc(db, "settings", "store"));
        if (docSnap.exists()) {
          return res.json(docSnap.data());
        }
      }
      if (fs.existsSync(SETTINGS_FILE)) {
        const data = fs.readFileSync(SETTINGS_FILE, "utf-8");
        return res.json(JSON.parse(data));
      }
      return res.json({});
    } catch (err: any) {
      console.error("Error getting settings:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // API Route: Save store settings
  app.post("/api/settings", async (req, res) => {
    try {
      const settings = req.body;
      if (!settings || typeof settings !== "object") {
        return res.status(400).json({ status: 400, message: "Valid settings object required." });
      }

      let existing = {};
      try {
        if (fs.existsSync(SETTINGS_FILE)) {
          existing = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
        }
      } catch (e) {}

      const updated = { ...existing, ...settings };
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), "utf-8");

      if (db) {
        await setDoc(doc(db, "settings", "store"), updated, { merge: true });
      }

      res.json({ status: 200, message: "Settings saved successfully on server and cloud.", settings: updated });
    } catch (err: any) {
      console.error("Error saving settings:", err);
      res.status(500).json({ status: 500, message: err.message });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

// Integrate Vite for frontend serving
async function setupFrontendAndListen() {
  const currentDir = typeof __dirname !== "undefined" ? __dirname : process.cwd();
  
  let distPath = "";
  if (process.env.NODE_ENV === "production") {
    // In production, server.cjs runs from the dist folder, so the static files are in currentDir (dist/)
    distPath = currentDir;
  } else {
    // In development, the server runs from the root, so static files are in ./dist
    distPath = path.join(process.cwd(), "dist");
  }

  const hasDist = fs.existsSync(path.join(distPath, "index.html"));

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        } else {
          // Keep cache for assets
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      }
    }));
    // SPA fallback route
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (process.env.VERCEL !== "1" && process.env.NOW_BUILDER !== "1") {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

if (process.env.VERCEL !== "1" && process.env.NOW_BUILDER !== "1") {
  setupFrontendAndListen();
}

export default app;
