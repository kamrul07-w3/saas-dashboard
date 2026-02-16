import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.featureUsageSnapshot.deleteMany();
  await prisma.userActivitySnapshot.deleteMany();
  await prisma.revenueSnapshot.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // ─── Create Users ────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("password123", 12);

  const adminUser = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      emailVerified: new Date(),
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      name: "Regular User",
      email: "user@example.com",
      password: hashedPassword,
      emailVerified: new Date(),
    },
  });

  console.log(`Created users: ${adminUser.email}, ${regularUser.email}`);

  // ─── Create Team ─────────────────────────────────────────────
  const team = await prisma.team.create({
    data: {
      name: "Acme Corp",
      slug: "acme-corp",
    },
  });

  await prisma.teamMember.create({
    data: { userId: adminUser.id, teamId: team.id, role: "OWNER" },
  });

  await prisma.teamMember.create({
    data: { userId: regularUser.id, teamId: team.id, role: "MEMBER" },
  });

  console.log(`Created team: ${team.name} (${team.slug})`);

  // ─── Create Customers ────────────────────────────────────────
  const plans = ["Free", "Starter", "Pro", "Enterprise"];
  const statuses = ["ACTIVE", "ACTIVE", "ACTIVE", "INACTIVE", "CHURNED"] as const;
  const companies = [
    "TechStart Inc",
    "Digital Wave",
    "CloudNine Systems",
    "DataFlow Corp",
    "Innovate Labs",
    "Quantum Solutions",
    "ByteForce",
    "NexGen Software",
    "Pixel Perfect",
    "CodeCraft",
    "StreamLine Co",
    "Apex Digital",
    "FutureTech",
    "BrightPath",
    "CoreSync",
    null,
  ];

  const firstNames = [
    "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Henry",
    "Ivy", "Jack", "Karen", "Leo", "Mia", "Noah", "Olivia", "Paul",
    "Quinn", "Ryan", "Sarah", "Tom", "Uma", "Victor", "Wendy", "Xavier",
    "Yara", "Zach", "Aria", "Blake", "Clara", "Derek", "Elena", "Felix",
    "Gina", "Hugo", "Iris", "James", "Kate", "Liam", "Maya", "Nick",
    "Opal", "Peter", "Rosa", "Sam", "Tina", "Uri", "Vera", "Will",
    "Xena", "Yuri",
  ];

  const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
    "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
    "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
    "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark",
    "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King",
    "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green",
    "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
    "Carter", "Roberts",
  ];

  for (let i = 0; i < 50; i++) {
    const firstName = firstNames[i];
    const lastName = lastNames[i];
    const status = statuses[i % statuses.length];
    const plan = plans[i % plans.length];
    const company = companies[i % companies.length];
    const mrrValues: Record<string, number> = {
      Free: 0,
      Starter: 29 + Math.floor(Math.random() * 20),
      Pro: 99 + Math.floor(Math.random() * 50),
      Enterprise: 299 + Math.floor(Math.random() * 200),
    };
    const mrr = status === "CHURNED" ? 0 : mrrValues[plan];
    const joinedDaysAgo = Math.floor(Math.random() * 365) + 30;
    const joinedAt = new Date();
    joinedAt.setDate(joinedAt.getDate() - joinedDaysAgo);

    const lastActiveAt =
      status === "ACTIVE"
        ? new Date(Date.now() - Math.floor(Math.random() * 7) * 86400000)
        : status === "INACTIVE"
          ? new Date(Date.now() - Math.floor(Math.random() * 30 + 14) * 86400000)
          : null;

    await prisma.customer.create({
      data: {
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        company,
        status,
        plan,
        mrr,
        joinedAt,
        lastActiveAt,
        teamId: team.id,
      },
    });
  }

  console.log("Created 50 customers");

  // ─── Create Revenue Snapshots (90 days) ──────────────────────
  let baseMrr = 35000;
  for (let i = 89; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const newMrr = Math.floor(Math.random() * 800 + 200);
    const churnedMrr = Math.floor(Math.random() * 400 + 50);
    const netNewMrr = newMrr - churnedMrr;
    baseMrr += netNewMrr;

    await prisma.revenueSnapshot.create({
      data: {
        date,
        mrr: baseMrr,
        arr: baseMrr * 12,
        newMrr,
        churnedMrr,
        netNewMrr,
        teamId: team.id,
      },
    });
  }

  console.log("Created 90 days of revenue snapshots");

  // ─── Create User Activity Snapshots (90 days) ────────────────
  let baseDau = 120;
  for (let i = 89; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const dayOfWeek = date.getDay();
    const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.6 : 1;

    const dau = Math.floor(
      (baseDau + Math.floor(Math.random() * 30 - 10)) * weekendFactor
    );
    const wau = Math.floor(dau * (2.5 + Math.random() * 0.5));
    const mau = Math.floor(dau * (5 + Math.random()));
    const newSignups = Math.floor(Math.random() * 15 + 3);
    const churnedUsers = Math.floor(Math.random() * 5);

    baseDau += Math.floor(Math.random() * 3 - 1);

    await prisma.userActivitySnapshot.create({
      data: {
        date,
        dau,
        wau,
        mau,
        newSignups,
        churnedUsers,
        teamId: team.id,
      },
    });
  }

  console.log("Created 90 days of user activity snapshots");

  // ─── Create Feature Usage Snapshots (90 days x 5 features) ──
  const features = [
    { name: "Dashboard", baseUsage: 500, baseUsers: 100 },
    { name: "API Access", baseUsage: 1200, baseUsers: 45 },
    { name: "Reports", baseUsage: 300, baseUsers: 60 },
    { name: "Team Chat", baseUsage: 800, baseUsers: 80 },
    { name: "Integrations", baseUsage: 200, baseUsers: 30 },
  ];

  for (let i = 89; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    for (const feature of features) {
      const growthFactor = 1 + (90 - i) * 0.003;
      const usageCount = Math.floor(
        (feature.baseUsage + Math.floor(Math.random() * 100 - 50)) *
          growthFactor
      );
      const uniqueUsers = Math.floor(
        (feature.baseUsers + Math.floor(Math.random() * 15 - 5)) *
          growthFactor
      );

      await prisma.featureUsageSnapshot.create({
        data: {
          date,
          featureName: feature.name,
          usageCount: Math.max(0, usageCount),
          uniqueUsers: Math.max(0, uniqueUsers),
          teamId: team.id,
        },
      });
    }
  }

  console.log("Created 90 days of feature usage snapshots (5 features)");

  // ─── Create Notifications ────────────────────────────────────
  const notificationData = [
    {
      type: "SUCCESS",
      title: "Welcome to Acme Corp!",
      message: "Your team has been set up successfully. Start by inviting your team members.",
      userId: adminUser.id,
    },
    {
      type: "INFO",
      title: "New team member joined",
      message: "Regular User has joined the team as a member.",
      userId: adminUser.id,
    },
    {
      type: "WARNING",
      title: "Approaching API rate limit",
      message: "Your team has used 80% of the monthly API quota.",
      userId: adminUser.id,
    },
    {
      type: "SUCCESS",
      title: "Monthly report ready",
      message: "Your January 2026 revenue report is now available.",
      userId: adminUser.id,
    },
    {
      type: "ERROR",
      title: "Payment failed",
      message: "A customer payment of $299 has failed. Please check the billing details.",
      userId: adminUser.id,
    },
    {
      type: "INFO",
      title: "Welcome!",
      message: "Welcome to the team! Check out the dashboard to get started.",
      userId: regularUser.id,
    },
    {
      type: "SUCCESS",
      title: "Profile updated",
      message: "Your profile information has been updated successfully.",
      userId: regularUser.id,
    },
  ];

  for (const notification of notificationData) {
    await prisma.notification.create({ data: notification });
  }

  console.log(`Created ${notificationData.length} notifications`);

  // ─── Create Notification Preferences ─────────────────────────
  await prisma.notificationPreference.create({
    data: {
      userId: adminUser.id,
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      securityAlerts: true,
      weeklyDigest: true,
    },
  });

  await prisma.notificationPreference.create({
    data: {
      userId: regularUser.id,
      emailNotifications: true,
      pushNotifications: false,
      marketingEmails: false,
      securityAlerts: true,
      weeklyDigest: false,
    },
  });

  console.log("Created notification preferences");

  // ─── Create Activities ───────────────────────────────────────
  const activityData = [
    {
      type: "USER_SIGNUP",
      description: "Admin User created an account",
      userId: adminUser.id,
    },
    {
      type: "USER_SIGNUP",
      description: "Regular User created an account",
      userId: regularUser.id,
    },
    {
      type: "TEAM_MEMBER_ADDED",
      description: "Regular User was added to Acme Corp",
      userId: adminUser.id,
    },
    {
      type: "CUSTOMER_CREATED",
      description: "Added new customer: Alice Smith",
      userId: adminUser.id,
      metadata: { customerName: "Alice Smith" },
    },
    {
      type: "CUSTOMER_CREATED",
      description: "Added new customer: Bob Johnson",
      userId: adminUser.id,
      metadata: { customerName: "Bob Johnson" },
    },
    {
      type: "SETTINGS_UPDATED",
      description: "Team settings were updated",
      userId: adminUser.id,
    },
    {
      type: "API_KEY_CREATED",
      description: "New API key 'Production' was created",
      userId: adminUser.id,
      metadata: { keyName: "Production" },
    },
    {
      type: "CUSTOMER_UPDATED",
      description: "Updated customer: Charlie Williams",
      userId: regularUser.id,
      metadata: { customerName: "Charlie Williams" },
    },
    {
      type: "USER_LOGIN",
      description: "Admin User logged in",
      userId: adminUser.id,
    },
    {
      type: "USER_LOGIN",
      description: "Regular User logged in",
      userId: regularUser.id,
    },
  ];

  for (const activity of activityData) {
    await prisma.activity.create({
      data: {
        type: activity.type,
        description: activity.description,
        metadata: activity.metadata ?? undefined,
        userId: activity.userId,
        teamId: team.id,
      },
    });
  }

  console.log(`Created ${activityData.length} activities`);

  console.log("Seeding completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
