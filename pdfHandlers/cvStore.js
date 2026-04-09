let cvText = '';

function setCVText(text) {
    cvText = text;
}

function getCVText() {
    return cvText;
}

module.exports = { setCVText, getCVText };