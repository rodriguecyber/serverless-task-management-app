exports.handler = async (event) => {
  const email = event.request.userAttributes.email;

  const allowedDomains = [
    "amalitech.com",
    "amalitechtraining.org"
  ];

  const domain = email.split("@")[1];

  if (!allowedDomains.includes(domain)) {
    throw new Error("Signup restricted to approved organizational emails.");
  }

  return event;
};