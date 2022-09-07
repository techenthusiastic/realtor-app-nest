require('crypto').randomBytes(64, function (err, buffer) {
  var token = buffer.toString('hex');
  console.log(token);
});
