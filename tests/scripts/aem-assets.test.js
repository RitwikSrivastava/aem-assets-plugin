/* eslint-env jest */
import {
  testFunctions,
  decorateExternalImages,
  createOptimizedPictureForDMOpenAPI,
} from '../../scripts/aem-assets.js';

const { appendQueryParams } = testFunctions;
// scripts/aem-assets.test.js

describe('appendQueryParams', () => {
  it('should append allowed query parameters', () => {
    const url = new URL('https://example.com');
    const params = new Map([['rotate', '90'], ['crop', 'center']]);
    const result = appendQueryParams(url, params);
    expect(result).toBe('https://example.com/?rotate=90&crop=center');
  });

  it('should ignore disallowed query parameters', () => {
    const url = new URL('https://example.com');
    const params = new Map([['foo', 'bar'], ['rotate', '90']]);
    const result = appendQueryParams(url, params);
    expect(result).toBe('https://example.com/?foo=bar&rotate=90');
  });

  it('should handle empty parameters', () => {
    const url = new URL('https://example.com');
    const params = new Map();
    const result = appendQueryParams(url, params);
    expect(result).toBe('https://example.com/');
  });

  it('should handle URLs with existing query parameters', () => {
    const url = new URL('https://example.com?existing=param');
    const params = new Map([['rotate', '90']]);
    const result = appendQueryParams(url, params);
    expect(result).toBe('https://example.com/?existing=param&rotate=90');
  });
});

describe('decorateExternalImages', () => {
  beforeEach(() => {
    window.hlx = {
      aemassets: {
        externalImageUrlPrefixes: [
          ['https://delivery-p66302-e574366.adobeaemcloud.com/', createOptimizedPictureForDMOpenAPI],
        ],
      },
    };
  });

  it('preserves Universal Editor instrumentation attributes when replacing the anchor', () => {
    document.body.innerHTML = `
      <div>
        <a
          href="https://delivery-p66302-e574366.adobeaemcloud.com/adobe/assets/urn:aaid:aem:123/as/43.avif?assetname=43.jpg"
          title="blue car with black wheels"
          data-aue-prop="image"
          data-aue-type="reference"
          data-richtext-prop="image"
        >blue car with black wheels</a>
      </div>`;
    decorateExternalImages(document.body);

    const img = document.querySelector('picture img');
    expect(img).not.toBeNull();
    expect(img.getAttribute('data-aue-prop')).toBe('image');
    expect(img.getAttribute('data-aue-type')).toBe('reference');
    expect(img.getAttribute('data-richtext-prop')).toBe('image');
    expect(img.getAttribute('alt')).toBe('blue car with black wheels');
  });
});
