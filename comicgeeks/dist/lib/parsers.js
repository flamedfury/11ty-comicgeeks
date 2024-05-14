"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
exports.default = {
    Issue: $ => (_, el) => {
        const element = $(el);
    
        // Extract cover image URL
        const coverSrc = element.find('img').attr('data-src') || '';
    
        // Extract publisher
        const publisher = element.find('.copy-really-small span').eq(0).text().trim();
    
        // Extract release year
        const releaseYearText = element.find('.copy-really-small span').eq(1).text().trim();
        const releaseYearMatch = releaseYearText.match(/\d{4}/g) || [];
        const releaseYear = releaseYearMatch.length > 0 ? releaseYearMatch[0] : null;
    
        // Extract title
        const title = element.find('.title.color-primary a').text().trim();
    
        return {
            name: title || '',
            publisher: publisher || '',
            cover: coverSrc.includes('no-cover') ? null : coverSrc,
            cover_medium: coverSrc || null,
            cover_small: coverSrc ? coverSrc.replace('medium', 'small') : null,
            date_start: releaseYear || null,
            date_end: releaseYear || null,
        };
    },
    
    Series: $ => (_, el) => {
        const element = $(el);

        const imgElement = element.find('.cover img');
        const coverSrc = imgElement.attr('data-src') || '';

        const dateElement = element.find('.copy-really-small.font-weight-bold.color-offset.text-truncate');
        const spans = dateElement.find('span');
        let date_start = null;
        let date_end = null;
        if (spans.length > 1) {
            const dateText = spans.eq(1).text().trim();
            const dates = dateText.split('·').map(d => d.trim());
            if (dates.length > 1) {
                date_start = dates[0];
                date_end = dates[1];
            } else if (dates.length === 1) {
                date_start = dates[0];
            }
        }

        return {
            name: element.find('.title.color-primary').text().trim() || '',
            publisher: spans.eq(0).text().trim() || '',
            url: `${constants_1.BASE_URL}${element.find('.cover a').attr('href') || ''}`,
            cover: coverSrc.replace('medium', 'large'),
            cover_medium: coverSrc,
            cover_small: coverSrc.replace('medium', 'small'),
            date: dateElement.text().trim() || '',
            date_start: date_start || null,
            date_end: date_end || null,
        };
    }
};
