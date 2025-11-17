"use server";

const ALLOWED_RESOURCES = [
  "profiles",
  "services",
  "categories",
  "amenities",
  "service-offerings",
  "service-ownership-claims",
  "reports",
  "city-descriptions",
  "city-images",
  "state-descriptions",
  "static-content",
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
