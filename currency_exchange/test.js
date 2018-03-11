$.ajax({
    url: 'https://data.fixer.io/api/latest?access_key=4f1ac1861df1befc366eb73b936df507&format=1&base=USD',
    success: function (data) {
        console.log(data.rates)
    },
});