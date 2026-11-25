/**
 * CampusFind – data.js
 * Seed data for the Lost & Found Portal SPA.
 * Exposed via window.CAMPUSFIND_DATA so app.js can access it.
 */

window.CAMPUSFIND_DATA = {

  foundItems: [
    {
      id: "f1",
      name: "Gold Ornament",
      category: "Jewellery",
      description: "A delicate gold necklace with a small pendant, found near the library entrance.",
      location: "College Library",
      dateFound: "2026-11-04",
      status: "Pending",
      finderName: "Rahul Sharma",
      finderEmail: "rahul@college.edu",
      image: "assets/images/gold-ornament.jpg"
    },
    {
      id: "f2",
      name: "Wristwatch",
      category: "Accessories",
      description: "A silver analog wristwatch, Titan brand, found on a bench near Classroom Block A.",
      location: "Classroom Block",
      dateFound: "2026-11-03",
      status: "Pending",
      finderName: "Priya Patel",
      finderEmail: "priya@college.edu",
      image: "assets/images/wristwatch.jpg"
    },
    {
      id: "f3",
      name: "Bracelet",
      category: "Jewellery",
      description: "A thin gold bracelet with a small heart charm found near the auditorium stage door.",
      location: "College Auditorium",
      dateFound: "2026-11-02",
      status: "Claimed",
      finderName: "Amit Kumar",
      finderEmail: "amit@college.edu",
      image: "assets/images/bracelet.jpg"
    },
    {
      id: "f4",
      name: "Black Wallet",
      category: "Personal Belongings",
      description: "A black leather wallet containing some cash and a few cards. Found near the canteen counter.",
      location: "College Canteen",
      dateFound: "2026-11-01",
      status: "Returned",
      finderName: "Sneha Reddy",
      finderEmail: "sneha@college.edu",
      image: "assets/images/wallet.jpg"
    },
    {
      id: "f5",
      name: "College ID Card",
      category: "Documents",
      description: "An ID card belonging to a student, found near the computer lab entrance. Name: Vikram Singh.",
      location: "Computer Lab",
      dateFound: "2026-10-31",
      status: "Returned",
      finderName: "Pooja Nair",
      finderEmail: "pooja@college.edu",
      image: "assets/images/id-card.jpg"
    },
    {
      id: "f6",
      name: "Wireless Earphones",
      category: "Electronics",
      description: "A pair of black wireless earphones (Sony brand) in a case, found near Library reading section.",
      location: "College Library",
      dateFound: "2026-10-30",
      status: "Pending",
      finderName: "Karan Mehta",
      finderEmail: "karan@college.edu",
      image: "assets/images/earphones.jpg"
    },
    {
      id: "f7",
      name: "Water Bottle",
      category: "Personal Belongings",
      description: "A blue stainless steel water bottle with stickers, found in the cafeteria.",
      location: "Cafeteria",
      dateFound: "2026-10-29",
      status: "Pending",
      finderName: "Divya Joshi",
      finderEmail: "divya@college.edu",
      image: "assets/images/water-bottle.jpg"
    },
    {
      id: "f8",
      name: "Umbrella",
      category: "Accessories",
      description: "A black compact folding umbrella found near the main gate security cabin.",
      location: "Main Gate",
      dateFound: "2026-10-28",
      status: "Pending",
      finderName: "Arjun Das",
      finderEmail: "arjun@college.edu",
      image: "assets/images/umbrella.jpg"
    },
    {
      id: "f9",
      name: "Scientific Calculator",
      category: "Electronics",
      description: "A Casio FX-991ES scientific calculator found in Room 204 after the Math exam.",
      location: "Room 204",
      dateFound: "2026-10-27",
      status: "Pending",
      finderName: "Meera Pillai",
      finderEmail: "meera@college.edu",
      image: "assets/images/calculator.jpg"
    },
    {
      id: "f10",
      name: "Backpack",
      category: "Bags",
      description: "A grey Nike backpack containing notebooks and stationery. Found near the sports ground.",
      location: "Sports Ground",
      dateFound: "2026-10-26",
      status: "Claimed",
      finderName: "Ravi Teja",
      finderEmail: "ravi@college.edu",
      image: "assets/images/backpack.jpg"
    }
  ],

  lostItems: [
    {
      id: "l1",
      name: "Apple AirPods Pro",
      category: "Electronics",
      description: "White AirPods Pro in a white charging case with a small scratch on the lid. Very important to me.",
      lastSeen: "Science Block Corridor",
      dateLost: "2026-11-05",
      status: "Searching",
      ownerName: "Aisha Khan",
      ownerEmail: "aisha@college.edu",
      image: "assets/images/airpods.jpg"
    },
    {
      id: "l2",
      name: "Blue Denim Jacket",
      category: "Clothing",
      description: "A medium-sized blue denim jacket with a small college badge on the left chest pocket.",
      lastSeen: "College Canteen",
      dateLost: "2026-11-04",
      status: "Searching",
      ownerName: "Rohit Verma",
      ownerEmail: "rohit@college.edu",
      image: "assets/images/denim-jacket.jpg"
    },
    {
      id: "l3",
      name: "Prescription Glasses",
      category: "Accessories",
      description: "Black rectangular frame glasses with -2.5 power prescription. In a brown leather case.",
      lastSeen: "Library",
      dateLost: "2026-11-03",
      status: "Searching",
      ownerName: "Sunita Rao",
      ownerEmail: "sunita@college.edu",
      image: "assets/images/glasses.jpg"
    },
    {
      id: "l4",
      name: "Engineering Drawing Kit",
      category: "Stationery",
      description: "A full set of drawing instruments in a metal box. Has my name 'Deepak' written inside the lid.",
      lastSeen: "Drawing Hall",
      dateLost: "2026-11-02",
      status: "Found",
      ownerName: "Deepak Sharma",
      ownerEmail: "deepak@college.edu",
      image: "assets/images/drawing-kit.jpg"
    },
    {
      id: "l5",
      name: "Red Power Bank",
      category: "Electronics",
      description: "A red 10000mAh Mi power bank with a small sticker of a guitar on it.",
      lastSeen: "Seminar Hall",
      dateLost: "2026-11-01",
      status: "Searching",
      ownerName: "Fatima Hussain",
      ownerEmail: "fatima@college.edu",
      image: "assets/images/powerbank.jpg"
    },
    {
      id: "l6",
      name: "Student Pass Book",
      category: "Documents",
      description: "A blue SBI bank passbook belonging to Kavya Reddy. Found near the ATM kiosk area.",
      lastSeen: "ATM Kiosk",
      dateLost: "2026-10-31",
      status: "Searching",
      ownerName: "Kavya Reddy",
      ownerEmail: "kavya@college.edu",
      image: "assets/images/passbook.jpg"
    }
  ],

  claims: [
    {
      id: "c1",
      itemId: "f1",
      itemName: "Gold Ornament",
      studentName: "Nisha Gupta",
      studentEmail: "nisha@college.edu",
      description: "This is my gold necklace that I lost near the library on November 4th. It has a small lotus pendant.",
      identifiers: "The pendant has a tiny engraving 'NG' on the back.",
      status: "Pending",
      dateClaimed: "2026-11-05"
    },
    {
      id: "c2",
      itemId: "f3",
      itemName: "Bracelet",
      studentName: "Anjali Singh",
      studentEmail: "anjali@college.edu",
      description: "I lost this bracelet at the auditorium during the cultural event on November 2nd.",
      identifiers: "The bracelet has a small heart charm and my name is engraved inside: 'Anjali'",
      status: "Approved",
      dateClaimed: "2026-11-04"
    },
    {
      id: "c3",
      itemId: "f10",
      itemName: "Backpack",
      studentName: "Suresh Kumar",
      studentEmail: "suresh@college.edu",
      description: "This grey Nike backpack is mine. I left it at the sports ground after practice.",
      identifiers: "My student ID card is inside one of the pockets, and there's a red pen with 'SK' written on it.",
      status: "Pending",
      dateClaimed: "2026-11-06"
    }
  ],

  notifications: [
    {
      id: "n1",
      itemId: "l4",
      itemName: "Engineering Drawing Kit",
      ownerName: "Deepak Sharma",
      ownerEmail: "deepak@college.edu",
      finderName: "Rahul Sharma",
      finderContact: "rahul.sharma@college.edu",
      location: "Main Gate Security Desk",
      message: "Hey Deepak! I found your metal drawing box in the Drawing Hall and deposited it with Officer Ramesh at the Main Gate Security Cabin. You can collect it with your student ID.",
      timestamp: "2026-11-08T11:45:00",
      read: false
    }
  ],

  myActivity: {
    lost: ["l1"],
    found: ["f6"],
    claims: ["c1"],
    notified: ["n1"]
  }

};
