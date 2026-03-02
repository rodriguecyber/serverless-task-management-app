const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const ses = new SESClient({ region: process.env.AWS_REGION });
const FROM_EMAIL = process.env.NOTIFY_FROM_EMAIL || "noreply@example.com";

async function sendEmail(toAddresses, subject, bodyText) {
  if (!toAddresses.length) return;
  await ses.send(new SendEmailCommand({
    Source: FROM_EMAIL,
    Destination: { ToAddresses: toAddresses },
    Message: {
      Subject: { Data: subject },
      Body: { Text: { Data: bodyText } }
    }
  }));
}

exports.handler = async (event) => {
  for (const record of event.Records || []) {
    try {
      const msg = JSON.parse(record.Sns?.Message || "{}");
      const { type } = msg;

      if (type === "task_assigned") {
        const { toEmail, taskTitle, taskId } = msg;
        if (!toEmail) {
          console.warn("notify_task_events: task_assigned missing toEmail", msg);
          continue;
        }
        await sendEmail(
          [toEmail],
          `Task assigned: ${taskTitle || taskId || "Task"}`,
          `A task has been assigned to you.\n\nTask: ${taskTitle || "Untitled"}\nTask ID: ${taskId || "—"}\n\nPlease sign in to the Task Management app to view and update it.`
        );
      } else if (type === "task_status_updated") {
        const { adminEmails, taskTitle, taskId, newStatus } = msg;
        const emails = Array.isArray(adminEmails) ? adminEmails : adminEmails ? [adminEmails] : [];
        if (emails.length === 0) {
          console.warn("notify_task_events: task_status_updated no adminEmails", msg);
          continue;
        }
        const bodyText = `A task's status was updated.\n\nTask: ${taskTitle || "Untitled"}\nTask ID: ${taskId || "—"}\nNew status: ${newStatus || "—"}\n\nSign in to the Task Management app for details.`;
        await sendEmail(
          emails,
          `Task status updated: ${taskTitle || taskId || "Task"} → ${newStatus || ""}`,
          bodyText
        );
      } else {
        console.warn("notify_task_events: unknown type", type, msg);
      }
    } catch (err) {
      console.error("notify_task_events error:", err);
      throw err;
    }
  }
};
