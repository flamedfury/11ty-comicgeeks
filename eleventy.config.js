require('dotenv').config()

const __siteroot = __dirname.replace("/cli", "");
const fetchComics = (...args) => import('./cli/commands/fetchComics.js').then(({default: fetchComics}) => fetchComics(...args));

module.exports = function (eleventyConfig) {

  eleventyConfig.addPassthroughCopy ("src/assets/css/styles.css");

  if (process.env.ELEVENTY_RUN_MODE === "build") {
    eleventyConfig.on("beforeBuild", async () => {
        await fetchComics(__siteroot);
    });
  }

  return {
    dir: {
      input: "src",
      output: "dist"
    },
  };
};