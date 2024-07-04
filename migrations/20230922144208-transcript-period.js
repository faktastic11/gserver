// kind of used this https://postulate.us/@samsonzhang/postulate/p/2021-03-06-Making-Mongodb-Schema-Changes-with-kL4J3vYUhY9V6SK16TisC7

// get rid of unwanted fields
module.exports = {
  async up(db, client) {
    const processedTranscripts = db.collection('processedTranscripts')
    const processedTranscriptsCursor = processedTranscripts.find()

    while (await processedTranscriptsCursor.hasNext()) {
      const pT = await processedTranscriptsCursor.next()

      const guidanceYr = pT?.fiscalYear
      const guidanceQtr = pT?.fiscalQuarter

      await processedTranscripts.updateOne(
        { _id: pT._id },
        { $unset: { industry: '', startOfPeriod: '', endOfPeriod: '' } },
      )
    }
  },

  async down(db, client) {
    return
  },
}
