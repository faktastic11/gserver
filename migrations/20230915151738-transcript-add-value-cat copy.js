// kind of used this https://postulate.us/@samsonzhang/postulate/p/2021-03-06-Making-Mongodb-Schema-Changes-with-kL4J3vYUhY9V6SK16TisC7
module.exports = {
  async up(db, client) {
    const processedTranscripts = db.collection('processedTranscripts')
    const processedTranscriptsCursor = processedTranscripts.find()

    while (await processedTranscriptsCursor.hasNext()) {
      const pT = await processedTranscriptsCursor.next()

      await processedTranscripts.updateOne({ _id: pT._id }, { $set: { valueCategory: 'unknown' } })
    }
  },

  async down(db, client) {
    const processedTranscripts = db.collection('processedTranscripts')
    const processedTranscriptsCursor = processedTranscripts.find()

    while (await processedTranscriptsCursor.hasNext()) {
      const pT = await processedTranscriptsCursor.next()

      await processedTranscripts.updateOne({ _id: pT._id }, { $unset: { valueCategory: '' } })
    }
  },
}
