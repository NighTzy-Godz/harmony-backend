function renderCustomId(numLength, letterLength) {
  const numbers = "0123456789";
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let customId = "";

  let numSetter = "";
  let numberId = "";

  let letterSetter = "";
  let letterId = "";
  for (let i = 0; i < numLength; i++) {
    numSetter = numbers[Math.floor(Math.random() * 10)];
    numberId += numSetter;
  }
  for (let i = 0; i < letterLength; i++) {
    letterSetter = letters[Math.floor(Math.random() * 26)];
    letterId += letterSetter;
  }

  return (customId = `${numberId}-${letterId}`);
}

module.exports = { renderCustomId };
