import test from 'node:test'
import assert from 'node:assert/strict'
import { searchLandmarks } from './searchUtils.js'

const landmarks = [
  {
    id: 1,
    name: 'Kamla Raheja Vidyanidhi Institute',
    road: 'Vidyanidhi Marg',
    category: 'Government',
    description: 'A premier educational institution in the locality.',
  },
  {
    id: 2,
    name: 'Kishore Kumar Bagh',
    road: 'Vidyanidhi Marg',
    category: 'Park',
    description: 'A landscaped greenspace for relaxation.',
  },
  {
    id: 3,
    name: 'Shree Kalimata Temple',
    road: 'Cross Road No. 7',
    category: 'Temple',
    description: 'A spiritual landmark with regular community visits.',
  },
]

test('ranks exact landmark names before road and category matches', () => {
  const results = searchLandmarks('Kamla', landmarks)
  assert.equal(results[0].id, 1)
  assert.equal(results[0].matchType, 'exactName')
})

test('matches category synonyms such as schools and parks', () => {
  const schoolResults = searchLandmarks('school', landmarks)
  assert.equal(schoolResults.length, 0)

  const parkResults = searchLandmarks('park', landmarks)
  assert.equal(parkResults[0].id, 2)
})

test('matches road names and description text', () => {
  const roadResults = searchLandmarks('vidyanidhi', landmarks)
  assert.equal(roadResults.some((item) => item.id === 1), true)
  assert.equal(roadResults.some((item) => item.id === 2), true)
})
