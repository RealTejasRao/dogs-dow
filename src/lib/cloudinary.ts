import type { CloudImage } from './models';

export function cloudinaryUrl(image: CloudImage, width: number, aspectRatio?: number) {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloud) return undefined;
  const id = image.publicId.split('/').map(encodeURIComponent).join('/');
  const sizing = aspectRatio ? `c_fill,w_${width},h_${Math.round(width / aspectRatio)},g_${image.crop}` : `c_limit,w_${width}`;
  return `https://res.cloudinary.com/${encodeURIComponent(cloud)}/image/upload/f_auto,q_auto,${sizing}/${id}`;
}
