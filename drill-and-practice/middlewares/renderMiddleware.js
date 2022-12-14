import { configure, renderFile } from "../deps.js";

const renderMiddleware = async (context, next) => {
  configure({
    views: `${Deno.cwd()}/views/`,
    cache: true,
  });

  context.render = async (file, data) => {
    context.response.headers.set("Content-Type", "text/html; charset=utf-8");
    context.response.body = await renderFile(file, {
      ...data,
      user: context.user,
    });
  };

  await next();
};

export { renderMiddleware };
