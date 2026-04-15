import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getCallsCollection } from "@/lib/db";

// DELETE: remove all seed data
export async function DELETE(request: NextRequest) {
  const auth = await verifyAuth(request, "admin");
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 });

  const calls = await getCallsCollection();
  const result = await calls.deleteMany({ room_name: { $regex: /^seed-/ } });
  return NextResponse.json({ deleted: result.deletedCount });
}

// POST: seed realistic call data
export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request, "admin");
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 });

  const callers = [
    { name: "Sarah Mitchell", phone: "+1-312-555-0142" },
    { name: "James Rodriguez", phone: "+1-773-555-0298" },
    { name: "Emily Chen", phone: "+1-847-555-0371" },
    { name: "Michael Thompson", phone: "+1-630-555-0184" },
    { name: "Lisa Patel", phone: "+1-312-555-0456" },
    { name: "David Kim", phone: "+1-773-555-0523" },
    { name: "Amanda Foster", phone: "+1-815-555-0167" },
    { name: "Robert Williams", phone: "+1-312-555-0634" },
    { name: "Jennifer Lopez", phone: "+1-630-555-0291" },
    { name: "Thomas Anderson", phone: "+1-773-555-0108" },
    { name: "Maria Garcia", phone: "+1-847-555-0745" },
    { name: "Kevin O'Brien", phone: "+1-312-555-0382" },
    { name: "Rachel Green", phone: "+1-630-555-0519" },
    { name: "Daniel Nguyen", phone: "+1-773-555-0826" },
    { name: "Sophia Martinez", phone: "+1-815-555-0193" },
    { name: "William Turner", phone: "+1-312-555-0947" },
    { name: "Natalie Brooks", phone: "+1-847-555-0264" },
    { name: "Christopher Lee", phone: "+1-773-555-0315" },
    { name: "Jessica Taylor", phone: "+1-630-555-0478" },
    { name: "Andrew Clark", phone: "+1-312-555-0582" },
  ];

  const caseTypes = [
    "PERSONAL_INJURY", "FAMILY_LAW", "CRIMINAL_DEFENSE", "EMPLOYMENT_LAW",
    "REAL_ESTATE", "CORPORATE", "IMMIGRATION", "ESTATE_PLANNING", "OTHER",
  ];

  const urgencies = ["URGENT", "HIGH", "MEDIUM", "LOW"];
  const scores = ["HIGH", "MEDIUM", "LOW", "NOT_APPLICABLE"];
  const spamValues = ["NOT_SPAM", "NOT_SPAM", "NOT_SPAM", "NOT_SPAM", "SPAM", "NOT_SURE"];
  const callbackValues = ["YES", "YES", "NO", "NOT_SURE"];

  const reasons: Record<string, string[]> = {
    PERSONAL_INJURY: [
      "Was rear-ended at a stoplight on Michigan Ave. Neck and back pain since the accident.",
      "Slipped on wet floor at a grocery store. Broke my wrist. No warning sign was posted.",
      "Dog bit my 6-year-old at the park. The owner let it off leash. Needed 12 stitches.",
      "Workplace injury from faulty scaffolding. Employer didn't provide safety harness.",
    ],
    FAMILY_LAW: [
      "Filing for divorce after 12 years. Two kids and joint property. Need custody arrangement.",
      "Ex-husband is not following the visitation agreement. Keeps kids past his weekends.",
      "Need to establish paternity and get child support payments started.",
      "Looking to adopt my stepdaughter. Biological father absent for 3 years.",
    ],
    CRIMINAL_DEFENSE: [
      "Son arrested for alleged assault. He was defending himself. Need representation.",
      "Charged with DUI but wasn't driving. Was sleeping in my car in the parking lot.",
      "Wrongfully accused of shoplifting. Have receipts proving purchase.",
    ],
    EMPLOYMENT_LAW: [
      "Terminated after filing harassment complaint against supervisor. Believe it's retaliation.",
      "Employer hasn't paid overtime for 6 months. Have timesheets to prove it.",
      "Severance package seems very low. Need someone to review the agreement.",
    ],
    REAL_ESTATE: [
      "Landlord refusing to return $2,500 security deposit. No damages documented at move-out.",
      "Dispute with neighbor over fence built on my property line. Survey confirms it.",
      "Buying commercial property. Need contract review before closing next week.",
    ],
    CORPORATE: [
      "Starting a tech startup with two co-founders. Need operating agreement and equity split.",
      "Vendor breached supply contract. Lost $45,000 in revenue. Want legal options.",
      "Need to dissolve a partnership. Other party not cooperating.",
    ],
    IMMIGRATION: [
      "H-1B visa expires in 3 months. Employer willing to sponsor renewal.",
      "Married a US citizen last year. Want to apply for green card.",
      "Asylum case denied. Want to file appeal before 30-day deadline.",
    ],
    ESTATE_PLANNING: [
      "Want to set up a living trust for two properties and retirement accounts.",
      "Mother passed away last month. Sibling is contesting the will.",
      "Need to update will after divorce and remarrying.",
    ],
    OTHER: [
      "Received a cease and desist letter over a blog post. Want to understand my rights.",
      "Contractor took $15,000 for kitchen renovation and never completed the work.",
      "Need help with a small claims court filing for property damage.",
    ],
  };

  const steps: Record<string, string[][]> = {
    PERSONAL_INJURY: [
      ["Schedule initial consultation within 24 hours", "Request medical records and police report", "Send preservation letter to at-fault party's insurance"],
      ["Request incident report from the store", "Collect photos of the scene and injury", "Schedule medical evaluation"],
    ],
    FAMILY_LAW: [
      ["Schedule confidential consultation", "Gather financial documents and tax returns", "Prepare parenting plan proposal"],
      ["Review existing custody agreement", "Document visitation violations with dates", "File motion for contempt if needed"],
    ],
    CRIMINAL_DEFENSE: [
      ["Review arrest report and charges", "Request body cam footage within 48 hours", "Prepare bail hearing arguments"],
      ["Obtain parking lot surveillance footage", "Collect witness statements", "File motion to dismiss"],
    ],
    EMPLOYMENT_LAW: [
      ["File EEOC complaint within 180 days", "Gather performance reviews and emails", "Request HR personnel file"],
      ["Organize timesheets and pay stubs", "File wage complaint with IL Dept of Labor", "Draft demand letter"],
    ],
    REAL_ESTATE: [
      ["Send demand letter for deposit return", "File complaint with housing authority", "Prepare for small claims"],
      ["Review property survey report", "Send cease and desist letter", "Prepare quiet title action"],
    ],
    CORPORATE: [
      ["Draft operating agreement with vesting schedule", "File articles of organization", "Prepare IP assignment agreements"],
      ["Review original contract terms", "Calculate actual damages", "Draft demand letter to vendor"],
    ],
    IMMIGRATION: [
      ["Prepare I-129 petition with LCA", "Gather supporting employment documents", "File before current visa expires"],
      ["Prepare I-130 and I-485 concurrent filing", "Gather marriage certificate and joint documents", "Schedule biometrics appointment"],
    ],
    ESTATE_PLANNING: [
      ["Inventory all assets and beneficiaries", "Draft revocable living trust", "Prepare pour-over will and power of attorney"],
      ["Locate and review original will", "Document grounds for contesting", "File petition in probate court"],
    ],
    OTHER: [
      ["Review cease and desist letter in detail", "Assess first amendment protections", "Prepare response letter"],
      ["Document all payments and contract terms", "Send formal demand letter", "File in small claims court"],
    ],
  };

  const transcripts: Record<string, string[]> = {
    PERSONAL_INJURY: [
      "user: Hi, I was in a car accident two weeks ago on Michigan Avenue.\nassistant: I'm sorry to hear that. Are you okay? Can you tell me what happened?\nuser: Someone rear-ended me at a stoplight. I've been having neck and back pain since then.\nassistant: That sounds very stressful. Have you sought medical treatment?\nuser: Yes, I went to the ER and now I'm doing physical therapy twice a week.\nassistant: I understand. Have you been in contact with the other driver's insurance company?\nuser: They called me but their offer is way too low. They're saying it's only minor whiplash.\nassistant: I'll make a note of that. May I have your name and contact information so one of our attorneys can reach out to discuss your options?",
    ],
    FAMILY_LAW: [
      "user: Hello, I need to speak with someone about filing for divorce.\nassistant: I understand this is a difficult time. Can you share a bit about your situation?\nuser: My husband and I have been married 12 years. We have two kids, ages 8 and 11.\nassistant: Thank you for sharing that. Are there any immediate concerns regarding custody or safety?\nuser: No safety issues, but I want to make sure I get fair custody. He travels a lot for work.\nassistant: That's helpful to know. Do you currently own property together?\nuser: Yes, we have a house in Lincoln Park and a joint savings account.\nassistant: I'll connect you with one of our family law attorneys. What's the best number to reach you?",
    ],
    CRIMINAL_DEFENSE: [
      "user: My son was arrested last night and I don't know what to do.\nassistant: I'm sorry to hear that. Take a deep breath — we're here to help. What are the charges?\nuser: They're saying assault but he was defending himself. Some guy came at him outside a bar.\nassistant: Was anyone else present who witnessed the incident?\nuser: Yes, his friends were there and they saw everything.\nassistant: Good, witness statements will be important. Has he been arraigned yet?\nuser: Not yet. They said the hearing is tomorrow morning.\nassistant: We'll need to move quickly. Let me get your contact information and one of our criminal defense attorneys will call you before the hearing.",
    ],
    EMPLOYMENT_LAW: [
      "user: I was fired last week and I think it was because I reported my boss for harassment.\nassistant: I'm sorry you're going through this. Can you tell me more about what happened?\nuser: I filed an HR complaint about inappropriate comments. Two weeks later they terminated me for performance issues.\nassistant: Had you received any performance warnings before the complaint?\nuser: No, never. I had consistently good reviews for 3 years.\nassistant: That's an important detail. Do you have copies of your performance reviews?\nuser: Yes, I saved them all in my personal email.\nassistant: Excellent. This could be a retaliation case. Let me connect you with an employment law specialist.",
    ],
    REAL_ESTATE: [
      "user: My landlord won't give me back my security deposit. I moved out a month ago.\nassistant: That's frustrating. How much was the deposit?\nuser: Twenty-five hundred dollars. They're claiming damages but I have photos from move-out day.\nassistant: Did you do a move-out walkthrough with the landlord?\nuser: I asked but they never responded. I sent the photos via email.\nassistant: Illinois law requires landlords to return deposits or itemize damages within 30 days. Let me get your details so we can help.",
    ],
    CORPORATE: [
      "user: Hi, I'm starting a tech company with two friends and we need a founders agreement.\nassistant: Congratulations! Can you tell me about the business structure?\nuser: We want to be an LLC. I'm the technical co-founder, one handles BD, the other product design.\nassistant: Have you discussed how you'll split equity?\nuser: Equal thirds but we want vesting so nobody walks away with a third on day one.\nassistant: Smart approach. A 4-year vesting with 1-year cliff is standard. Let me connect you with our corporate team.",
    ],
    IMMIGRATION: [
      "user: Hello, I need help with my H-1B renewal. It expires in about three months.\nassistant: Of course. Is your current employer willing to sponsor the renewal?\nuser: Yes, they've already said they'll support it.\nassistant: Do you have your current I-797 approval notice and recent pay stubs?\nuser: Yes, I have all my documents organized.\nassistant: Great. We have time to prepare a strong application. Let me schedule a consultation with our immigration attorney.",
    ],
    ESTATE_PLANNING: [
      "user: I want to set up a living trust. I have two properties and some retirement accounts.\nassistant: That's a smart move. Can you tell me about your family situation?\nuser: Married with three grown kids. I want everything to go smoothly for them.\nassistant: Are your children financially responsible, or would you want conditions on distributions?\nuser: I trust them, but I'd like my spouse to have full access first. Then kids split equally.\nassistant: A revocable living trust with a survivorship clause would work well. Let me set up a meeting with our estate planning team.",
    ],
    OTHER: [
      "user: A contractor took fifteen thousand dollars for my kitchen renovation and ghosted me.\nassistant: That's terrible. Do you have a written contract?\nuser: Yes, signed contract and text messages where they kept promising to come finish.\nassistant: Did they complete any of the work?\nuser: They demolished my old kitchen and then never came back. It's been unusable for two months.\nassistant: With a signed contract and documented communications, you have a strong case. Let me connect you with our attorney.",
    ],
  };

  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  function genCall(index: number, daysAgo: number) {
    const caller = pick(callers);
    const isSpam = pick(spamValues);
    const caseType = isSpam === "SPAM" ? "NOT_APPLICABLE" : pick(caseTypes);
    const urgency = isSpam === "SPAM" ? pick(["LOW", "MEDIUM"]) : pick(urgencies);
    const score = isSpam === "SPAM" ? "NOT_APPLICABLE" : pick(scores);
    const callback = isSpam === "SPAM" ? "NO" : pick(callbackValues);

    const hour = randInt(8, 19);
    const minute = randInt(0, 59);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(hour, minute, 0, 0);

    const reason = isSpam === "SPAM"
      ? "Robocall / telemarketer — no legitimate legal inquiry"
      : pick(reasons[caseType] || reasons.OTHER);

    const recSteps = isSpam === "SPAM"
      ? []
      : pick(steps[caseType] || steps.OTHER);

    const transcript = isSpam === "SPAM"
      ? "user: Hi, this is Alex from Medicare—\nassistant: Thank you for calling Sterling & Associates. How can I help you with a legal matter today?\nuser: I'm calling about your Medicare benefits—\nassistant: This is a law firm. We don't handle Medicare. Have a good day."
      : pick(transcripts[caseType] || transcripts.OTHER);

    const callbackReason = callback === "YES" ? "Client requested a follow-up call to discuss next steps" : null;

    return {
      room_name: `seed-${index}-${Date.now()}`,
      participant_identity: `caller-${randInt(1000, 9999)}`,
      caller_name: caller.name,
      caller_phone: caller.phone,
      is_spam: isSpam,
      reason_for_call: reason,
      callback_required: callback,
      callback_required_reason: callbackReason,
      case_type: caseType,
      urgency,
      qualification_score: score,
      recommended_next_steps: recSteps,
      transcript,
      duration_seconds: isSpam === "SPAM" ? randInt(15, 45) : randInt(90, 480),
      called_at: date,
      created_at: date,
    };
  }

  const calls: ReturnType<typeof genCall>[] = [];

  // Today: 8 calls
  for (let i = 0; i < 8; i++) calls.push(genCall(calls.length, 0));
  // Past 6 days: 5-8 calls each
  for (let day = 1; day <= 6; day++) {
    const n = randInt(5, 8);
    for (let i = 0; i < n; i++) calls.push(genCall(calls.length, day));
  }
  // Past 3 weeks: 3-6 calls each
  for (let day = 7; day <= 21; day++) {
    const n = randInt(3, 6);
    for (let i = 0; i < n; i++) calls.push(genCall(calls.length, day));
  }

  const col = await getCallsCollection();
  const result = await col.insertMany(calls);

  return NextResponse.json({
    inserted: result.insertedCount,
    message: "Seeded call records. Use DELETE to remove seed data (room_name starts with 'seed-').",
  });
}
