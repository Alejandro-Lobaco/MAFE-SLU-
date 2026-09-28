import { address, contact } from "@/config/site";

export const telHref = (e164: string) => `tel:${e164}`;

export const callHref = telHref(contact.mobile.e164);
export const landlineHref = telHref(contact.landline.e164);

export function whatsappHref(message: string = contact.whatsappMessage) {
  return `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const mapsEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(address.mapsQuery)}&output=embed&hl=es`;
export const mapsDirectionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address.mapsQuery)}`;
