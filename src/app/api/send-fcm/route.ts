import { NextResponse } from "next/server";
import admin from "firebase-admin";

//const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
//const fcmServerKey = process.env.FCM_SERVER_KEY;
// let adminAvailable = false;

// if (!admin.apps.length && serviceAccountJson) {
//   const serviceAccount = JSON.parse(serviceAccountJson);

//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
    
//   });
//   adminAvailable = true;
// }
let adminAvailable = false;

try {
  // if (!admin.apps.length) {
  //   const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!);

  //   admin.initializeApp({
  //     credential: admin.credential.cert(serviceAccount),
  //   });
  // }
  // adminAvailable = true;
  if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}
adminAvailable = true;
} catch (error) {
  console.error("Firebase Admin init error:", error);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { token, title, body: messageBody, data } = body;
  console.log("🚀 BACKEND RECEIVED TOKEN:", token);

  if (!token || !title || !messageBody) {
    return NextResponse.json(
      { error: "Missing token, title, or body in request." },
      { status: 400 }
    );
  }

  try {
    if (adminAvailable) {
        const message: admin.messaging.Message = {
      token,
      notification: {
        title,
        body: messageBody,
        },
        data: {
          ...data,
          title,
          body: messageBody,
        },
        android: {
          priority: "high",
        },
        apns: {
          headers: {
            "apns-priority": "10",
          },
        },
        webpush: {
          headers: {
            Urgency: "high",
          },
          notification: {
              title: title,              
      body: messageBody,  
            icon: "/favicon.ico",
            requireInteraction: true,
          },
        },
      // data: {
      //    ...data,
      //     title,
      //     body: messageBody,
      //   },
      } as admin.messaging.Message;

      const response = await admin.messaging().send(message);
      return NextResponse.json({ success: true, messageId: response });
    }

    // if (!fcmServerKey) {
    //   return NextResponse.json(
    //     {
    //       error:
    //         "Missing FIREBASE_SERVICE_ACCOUNT or FCM_SERVER_KEY environment variable.",
    //     },
    //     { status: 500 }
    //   );
    // }

    const payload = {
      to: token,
      notification: {
        title,
        body: messageBody,
        icon: "/favicon.ico",
      },
      data: {
        ...data,
        title,
        body: messageBody,
      },
      priority: "high",
    };
  payload.data = payload.data || {};
  payload.data.title = title;
  console.log(payload.data.body = messageBody);
    // const response = await fetch("https://fcm.googleapis.com/fcm/send", {
    //   method: "POST",
    //   headers: {
    //     Authorization: `key=${fcmServerKey}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(payload),
    // });

    // const result = await response.json();
    // if (!response.ok) {
    //   return NextResponse.json({ error: result, status: response.status }, { status: response.status });
    // }

  //   return NextResponse.json({ success: true, result });
  // } catch (error) {
  //   console.error("FCM send error:", error);
  //   return NextResponse.json(
  //     { error: (error as Error).message || "FCM send failed." },
  //     { status: 500 }
  //   );
  // }

  
  } catch (error) {
    console.error("FCM send error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "FCM send failed. firebase admin not initialized" },
      { status: 500 }
    );
  }
}
