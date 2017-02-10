module.exports = {
    docDBConfig: {
        endpoint: process.env.DOBDB_ENDPOINT,
        primaryKey: process.env.DOCDB_KEY,
        dbName: "insights",
        colName: 'photos'
    },
    // docDBCollections: {
    //     locations: 'users',
    //     transactions: 'transactions',
    //     coffees: 'coffees',
    //     balances: 'balances',
    // },
    // APICalls: ['locations', 'heartrates']


};
