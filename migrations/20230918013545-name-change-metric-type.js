// kind of used this https://postulate.us/@samsonzhang/postulate/p/2021-03-06-Making-Mongodb-Schema-Changes-with-kL4J3vYUhY9V6SK16TisC7

// transform everything to the correct shape and change the name of the field of valueCategory
module.exports = {
  async up(db, client) {
    const processedTranscripts = db.collection('processedTranscripts')
    const processedTranscriptsCursor = processedTranscripts.find()

    while (await processedTranscriptsCursor.hasNext()) {
      const pT = await processedTranscriptsCursor.next()

      const metricType = pT?.MetricType || 'unknown'

      await processedTranscripts.updateOne({ _id: pT._id }, { $unset: { valueCategory: '' } })
      await processedTranscripts.updateOne({ _id: pT._id }, { $set: { metricType } })
    }
  },

  async down(db, client) {
    const processedTranscripts = db.collection('processedTranscripts')
    const processedTranscriptsCursor = processedTranscripts.find()

    while (await processedTranscriptsCursor.hasNext()) {
      const pT = await processedTranscriptsCursor.next()

      await processedTranscripts.updateOne({ _id: pT._id }, { $unset: { metricType: '' } })
      await processedTranscripts.updateOne({ _id: pT._id }, { $set: { valueCategory: pT.metricType } })
    }
  },
}
