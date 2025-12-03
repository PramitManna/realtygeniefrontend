declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}
declare global {
  interface Window {
    google: any;
  }
}

export {};