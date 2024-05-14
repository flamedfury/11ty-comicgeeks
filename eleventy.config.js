module.exports = function (eleventyConfig) {

  eleventyConfig.addPassthroughCopy ("src/assets/css/styles.css");

  return {
    dir: {
      input: "src",
      output: "dist"
    },
  };
};