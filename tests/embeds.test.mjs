import assert from 'node:assert/strict';
import { test } from 'node:test';

// The framework-free entry carries the embed registry.
const { EMBED_SERVICES, GENERIC_EMBED, resolveEmbed, getServiceSrc } =
  await import('../lib/core.js');

test('every service resolves its own example to itself', () => {
  for (const service of EMBED_SERVICES) {
    const resolved = resolveEmbed(service.example);
    assert.ok(resolved, `${service.key}: example did not resolve`);
    assert.equal(
      resolved.service.key,
      service.key,
      `${service.key}: example matched ${resolved.service.key}`
    );
    assert.match(resolved.src, /^https:\/\//, `${service.key}: src is not https`);
    assert.ok(resolved.height > 0);
  }
});

test('share links become embeddable URLs', () => {
  const cases = {
    'https://www.youtube.com/watch?v=I4sMhHbHYXM&t=10s':
      'https://www.youtube.com/embed/I4sMhHbHYXM',
    'https://youtu.be/I4sMhHbHYXM': 'https://www.youtube.com/embed/I4sMhHbHYXM',
    'https://www.youtube.com/shorts/I4sMhHbHYXM': 'https://www.youtube.com/embed/I4sMhHbHYXM',
    'https://vimeo.com/76979871': 'https://player.vimeo.com/video/76979871',
    'https://www.bilibili.com/video/BV1EJ411u7DN?p=2':
      'https://player.bilibili.com/player.html?bvid=BV1EJ411u7DN&autoplay=0',
    'https://www.loom.com/share/0281766fa2d04bb788eaf19e65135184':
      'https://www.loom.com/embed/0281766fa2d04bb788eaf19e65135184',
    'https://open.spotify.com/intl-de/track/4cOdK2wGLETKBW3PvgPWqT?si=x':
      'https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT',
    'https://www.figma.com/design/aS9uSgPXoNpaPkzbjNcK8v/Demo?node-id=0-1':
      'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2FaS9uSgPXoNpaPkzbjNcK8v%2FDemo%3Fnode-id%3D0-1',
    'https://miro.com/app/board/uXjVOZ8r4Yk=/': 'https://miro.com/app/live-embed/uXjVOZ8r4Yk=/',
    'https://codepen.io/mekery/pen/YzyrKOJ':
      'https://codepen.io/mekery/embed/YzyrKOJ?default-tab=result',
    'https://codesandbox.io/p/sandbox/new-abc123':
      'https://codesandbox.io/embed/new-abc123?view=preview',
    'https://stackblitz.com/edit/vitejs-vite-abc123?file=index.html':
      'https://stackblitz.com/edit/vitejs-vite-abc123?file=index.html&embed=1',
    'https://gist.github.com/octocat/6cad326836d38bd3a7ae':
      'https://gist.github.com/octocat/6cad326836d38bd3a7ae.pibb',
    'https://docs.google.com/spreadsheets/d/1AbC_dEf/edit#gid=0':
      'https://docs.google.com/spreadsheets/d/1AbC_dEf/preview',
    'https://docs.google.com/forms/d/e/1FAIpQLSdAbC/viewform?usp=sf_link':
      'https://docs.google.com/forms/d/e/1FAIpQLSdAbC/viewform?embedded=true',
    'https://airtable.com/appXXXX/shrYYYY': 'https://airtable.com/embed/shrYYYY',
    'https://trello.com/b/AbCdEfGh/roadmap': 'https://trello.com/b/AbCdEfGh.html',
    'https://www.google.com/maps/place/Eiffel+Tower/@48.85,2.29,17z':
      'https://maps.google.com/maps?q=Eiffel%20Tower&output=embed',
  };
  for (const [link, src] of Object.entries(cases)) {
    assert.equal(resolveEmbed(link)?.src, src, link);
  }
});

test('embed codes, protocol-less links and plain pages', () => {
  const snippet =
    '<iframe src="https://www.google.com/maps/embed?pb=!1m18" width="600" height="450" style="border:0;" allowfullscreen loading="lazy"></iframe>';
  assert.equal(resolveEmbed(snippet)?.src, 'https://www.google.com/maps/embed?pb=!1m18');
  assert.equal(
    resolveEmbed('youtu.be/I4sMhHbHYXM')?.src,
    'https://www.youtube.com/embed/I4sMhHbHYXM'
  );
  const page = resolveEmbed('https://example.com/docs');
  assert.equal(page?.service, GENERIC_EMBED);
  assert.equal(page?.src, 'https://example.com/docs');
  assert.equal(resolveEmbed('not a link'), null);
  assert.equal(resolveEmbed(''), null);
  assert.equal(resolveEmbed('javascript:alert(1)'), null);
});

test('the old helper keeps its shape', () => {
  const result = getServiceSrc('https://youtu.be/I4sMhHbHYXM');
  assert.equal(result.validLink, true);
  assert.equal(result.src, 'https://www.youtube.com/embed/I4sMhHbHYXM');
  assert.equal(getServiceSrc('nope').validLink, false);
});
