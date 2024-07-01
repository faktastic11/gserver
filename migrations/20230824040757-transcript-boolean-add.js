// kind of used this https://postulate.us/@samsonzhang/postulate/p/2021-03-06-Making-Mongodb-Schema-Changes-with-kL4J3vYUhY9V6SK16TisC7
module.exports = {
  async up(db, client) {
    const rawTranscripts = db.collection('rawTranscripts')
    const rawTranscriptsCursor = rawTranscripts.find()

    while (await rawTranscriptsCursor.hasNext()) {
      const rawTranscript = await rawTranscriptsCursor.next()
      const { _id, transcript } = rawTranscript

      const newTranscriptFormat = transcript.map((t) => ({ text: t, furtherProcess: null }))
      await rawTranscripts.updateOne({ _id }, { $set: { transcript: newTranscriptFormat } })
    }
  },

  async down(db, client) {
    const rawTranscripts = db.collection('rawTranscripts')
    const rawTranscriptsCursor = rawTranscripts.find()

    while (await rawTranscriptsCursor.hasNext()) {
      const rawTranscript = await rawTranscriptsCursor.next()
      const { _id, transcript } = rawTranscript

      const oldTranscriptFormat = transcript.map(({ text, _ }) => text)
      await rawTranscripts.updateOne({ _id }, { $set: { transcript: oldTranscriptFormat } })
    }
  },
}
