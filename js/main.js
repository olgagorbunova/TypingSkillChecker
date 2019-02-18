const names = ["Pippi Långstrump", "Flickan som lekte med elden", "Kallocain"];
const authors = ["Astrid Lindgren", "Stieg Larsson", "Karin Boye"];
const texts = ["Tommy och Annika gick naturligtvis i skolan. Varje morgon klockan åtta traskade de iväg hand i hand med skolböckerna under armen. Vid den tiden höll Pippi för det mesta på att rykta sin häst eller klä på Herr Nilsson hans lilla kostym. Eller också tog hon sin morgongymnastik, vilket gick till så att hon ställde sig käpprak på golvet och gjorde fyrtiotre frivolter efter varann. Därefter brukade hon sätta sig på köksbordet och i allsköns ro dricka en stor kopp kaffe med ostsmörgås till.", "Mikael Blomkvist satte pekfingret på dörrklockan till Lisbeth Salanders lägenhet på Lundagatan. Han förväntade sig inte att hon skulle öppna, men han hade tagit för vana att åka förbi hennes bostad någon gång i månaden för att undersöka om någon förändring hade ägt rum. Då han petade upp brevinkastet kunde han skymta högen av reklam. Klockan var strax efter tio på kvällen och det var för mörkt för att han skulle kunna avgöra hur mycket högen hade vuxit sedan sist. En kort stund stod han obeslutsam i trapphuset innan han frustrerat vände på klacken och lämnade fastigheten.", "Experimentet tog genast en ganska hotande vändning. Redan mycket tidigt på förmiddagen ringde vi till polishuset för att höra om något inträffat, och ändå var vi tydligen för sent ute. I inte mindre än nio fall av de tio hade makarna angivit sina makar. Om den tionde kanske redan också var på väg, var inte gott att säga - i varje fall var häktningsorder utfärdad, och vi kunde vänta personen i fråga till vårt laboratorium om två tre timmar. Inga ljusa utsikter precis. Jag måste medge, att jag var en smula överraskad över hur lojala över lag och hur snabba i vändningarna alla dessa makar hade visat sig vara - enbart glädjande naturligtvis, om det bara inte hade gällt experimentet. Säkert var att försöket måste upprepas. Åtminstone några säkra fall borde vi kunna lägga fram, innan uppfinningen kunde användas av Staten."];

var gameOn = false;
var textIdx = 0;

var letterCount = 0;
var errorCount = 0;
var textEnteredTotal = "";
var textEnteredPast = "";
var textEnteredFormated = "";

var gameStartTime = 0;
var gameCurrentTime = 0;

//Displays text, as well as name, author, character and word count.
function showText(){
  var wordCount = texts[textIdx].match(/\s/g).length + 1;
  var charCount = texts[textIdx].length;
  document.getElementById("text_name").innerHTML = names[textIdx];
  document.getElementById("text_author").innerHTML = authors[textIdx] + " (" + wordCount + " words, " + charCount + " characters)";
  formatText();
}

//Sets game variables to "0" and clears statistics on screen.
function clearData(){
  letterCount = 0;
  textEnteredTotal = "";
  textEnteredPast = "";
  textEnteredFormated = "";
  errorCount = 0;
  gameStartTime = 0;
  gameCurrentTime = 0;
  showStatistics();
}

//Ends a game.
function endGame(){
  gameOn = false;
  document.getElementById("game_btn").setAttribute("class", "play_btn");
  var textField = document.getElementById("text_input");
  textField.setAttribute("placeholder", "Press Play button to start...");
  textField.value = "";
  textField.setAttribute("readonly", "");
}

//Handles players chose of a text alternative. If player switches to a new text in the middle of the game, current game is over and data is lost.
function chooseText(e) {
  clearData();
  if(gameOn === true){
    gameOn = false;
    document.getElementById("text_input").value = "";
    document.getElementById("game_btn").setAttribute("class", "play_btn");
    document.getElementById("text_input").setAttribute("placeholder", "Press Play button to start...");
    document.getElementById("text_input").setAttribute("readonly", "");
  }
  if(e.target.value) {
    textIdx = e.target.value;
    showText();
  }
}

//Sets highlighter on a text character that is next to be typed.
function formatText() {
  var text = "<span class='typed'>" + textEnteredFormated + "</span>" + "<span class='highlighted'>" + texts[textIdx].substring(letterCount,letterCount+1) + "</span>" + texts[textIdx].substring(letterCount+1,texts[textIdx].length);
  document.getElementById("text").innerHTML = text;
}

//Calculates and displays statistics: error count, accuracy(%), gross and net WPM(Words Per Minute),
function showStatistics(){
  var accuracy = 0;
  var grossWPM = 0;
  var netWPM = 0;
  var nrOfErrors = countErrors();
  document.getElementById("errors").innerHTML = nrOfErrors;
  if(letterCount > 0)
    accuracy = (100 - Math.round((nrOfErrors / letterCount) * 100)) + "%";
  var minutesPlayed = (gameCurrentTime - gameStartTime) / 60000;
  if(minutesPlayed > 0){
    grossWPM = Math.round((letterCount / 5) / minutesPlayed);
    netWPM = Math.round(grossWPM - (nrOfErrors / minutesPlayed));
  }
  document.getElementById("accuracy").innerHTML = accuracy;
  document.getElementById("gross_wpm").innerHTML = grossWPM;
  document.getElementById("net_wpm").innerHTML = netWPM;
}

//Calculates and returns current total number of errors in entered text, taking into account user's choise to ignore casing or not. Plays a sound if an error is found.
function countErrors(){
  var currentText = texts[textIdx]
  var newErrors = 0;
  var input, originalValue;

  if(letterCount === 0)
    return 0;
  else{
    for(let i=(letterCount-1); i<textEnteredTotal.length; i++){
      if(document.getElementById("case_ignore").checked === false){
        input = textEnteredTotal[i];
        originalValue = currentText[i];
      }
      else {
        input = textEnteredTotal.charAt(i).toLowerCase();
        originalValue = currentText.charAt(i).toLowerCase();
      }
      if(input !== originalValue){
        newErrors++;
        errorSound.pause();
        errorSound.currentTime = 0;
        errorSound.play();
        if(textEnteredTotal[i] === " ")
          textEnteredFormated = textEnteredFormated + "<span class='error'>" + "-" + "</span>";
        else
          textEnteredFormated = textEnteredFormated + "<span class='error'>" + textEnteredTotal[i] + "</span>";
      }
      else {
        textEnteredFormated += textEnteredTotal[i];
      }
    }
    errorCount += newErrors;
  }
  return errorCount;
}

//Handles text entry during the game. Registers player input. Increments letter count that is used to highlight a letter that needs to be typed next. Calls formatText() to mark next letter to be typed, already typed text and erroneous input. Registers game start time and current time. Updates displaying of statistics.
function handleTextInput(e) {
  var d = new Date();
  if(gameCurrentTime === 0){
    gameStartTime = d.getTime();
  }
  gameCurrentTime = d.getTime();
  textEnteredTotal = textEnteredPast + e.target.value;
  letterCount += 1;

  showStatistics();
  formatText();
  if(letterCount === texts[textIdx].length){
    endGame();
  }
}

//Handles space key being pressed in text entry field by clearing the field and saving input. Prevents "Backspace" from being handled.
function handleEnteredCharacter(e) {
  if(e.key === " "){
    textEnteredPast += document.getElementById("text_input").value;
    document.getElementById("text_input").value = "";
  }
  if(e.key === "Backspace"){
    e.preventDefault();
  }
}

//Start game if "play" button is pressed, and ends game if "stop" button is pressed. Changes button image from "play" to "stop" and vice versa. Sets text highlighter to the beginnig of text, and clears text input field when new game starts. Regusters event handlers for text input field. Calls clearData() to clear variables when new game starts.
function handleGameButton(e) {
  if(gameOn === false) {
    gameOn = true;
    e.target.setAttribute("class", "stop_btn");
    clearData();
    document.getElementById("text_input").value = "";
    formatText();
    document.getElementById("text_input").setAttribute("placeholder", "Type here...");
    document.getElementById("text_input").removeAttribute("readonly");
  }
  else {
    endGame();
  }
  document.getElementById("text_input").addEventListener("input", handleTextInput, false);
  document.getElementById("text_input").addEventListener("keydown", handleEnteredCharacter, false);
}

//Displays first text and related information at game start. Registers event handlers for the game
function start() {
  showText();
  var textSelector = document.getElementById("text_select");
  textSelector.addEventListener("change", chooseText, false);
  var gameButton = document.getElementById("game_btn");
  gameButton.addEventListener("click", handleGameButton, false);
}

window.addEventListener("load", start, false);
