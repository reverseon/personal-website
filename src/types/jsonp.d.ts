declare module 'jsonp' {
  function jsonp(
    url: string,
    options: { param: string },
    callback: (err: Error | null, data: any) => void
  ): void;
  export default jsonp;
}
