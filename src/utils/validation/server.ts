// "use server"; // <-- REMOVA ESTA LINHA

const ALLOWED_RESOURCES = [
  "profiles",
  "services",
  "categories",
  "amenities",
  "service_offerings",
  "service_ownership_claims",
  "reports",
  "city_descriptions",
  "city_images",
  "cities",
  "state_descriptions",
  "static-content",
  "comments",
  "photos"
];

export function validateResource(resource: string) {
  if (!ALLOWED_RESOURCES.includes(resource)) {
    throw new Error(`Invalid resource: ${resource}`);
  }
}

const ALLOWED_CONTENT_RESOURCES = [
  "city_images",
  "city_descriptions",
  "state_descriptions",
];

export function validateContentResource(resource: string) {
  if (!ALLOWED_CONTENT_RESOURCES.includes(resource)) {
    throw new Error(`Invalid content resource: ${resource}`);
  }
}
