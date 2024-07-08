/// <reference lib="dom" />

// TODO: Confirmation that the test works.
// (This code itself does not test this site.)

import { test, expect } from 'bun:test';

test('dom test', () => {
  document.body.innerHTML = '<button>My button</button>';
  const button = document.querySelector('button');
  expect(button?.innerText).toEqual('My button');
});
