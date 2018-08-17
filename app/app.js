'use strict';

// =================================================================================
// App Configuration
// =================================================================================

const {App} = require('jovo-framework');
const request = require('sync-request');
const config = {
    logging: true,
};

const app = new App(config);
const apiBase = "http://192.168.0.101/api/v1/"

// =================================================================================
// App Logic
// =================================================================================
function chooseRandom (speech){
  return speech[Math.floor(Math.random()*speech.length)]
}

app.setHandler({
    'LAUNCH': function() {
        let speech = [
        "Salut, que dois je faire ?",
        "Content de vous entendre de nouveau, que puis-je faire pour vous ?",
        "Oui ?",
        "Quelle mode ?"]
        this.ask(chooseRandom(speech));
    },

    'modeIntent': function(query) {
      let res = request('GET', apiBase+"searchByName/"+query.value);
      let response = JSON.parse(res.getBody('utf8'));
      console.log(response)
      if(response["error"]==true){
        let speech = [
          'Sous windows, je ferais un écran bleu, mais ici je dirai juste que ce mode n\'existe pas',
          "Malheureusement, ce mode n'existe pas",
          "Non non non , vous essayez de lancer quelque chose qui n'existe pas, même Chuck Norris n'y arriverait pas"
        ]
        this.tell(chooseRandom(speech))
      }else{
        this.tell("mode "+response["sequencesName"]+" activé")
      }
    },
    actualStateIntent: function(){
      let res = request('GET', apiBase+"getSate");
      let response = JSON.parse(res.getBody('utf8'));
      this.tell("Actuellement, vous profitez du mode "+response["sequencesName"])
    },
    PlaySimonIntent: function(){
      this.followUpState("simonState").ask("Voulez vous jouer au jeux de Simon ?")
    },
    simonState: {
      YESintent: function(){
        let speech = "Bienvenue dans le jeux de simon."
        this.toIntent("color.SayColorIntent",speech)
      },
      NOIntent: function(){
        this.tell("J'annule la partie")
      },

      },
      color: {
        SayColorIntent: function(keyword){
        let userSentence = "rouge "+keyword.value
        let sentence = ""
        let numberToClass=
        {
          "bleu": 2,
          "vert": 4,
          "jaune": 5,
          "rouge": 6
        }
        let colors = []
        let color =""
        colors = this.getSessionAttribute("colors");
        if(colors===undefined){
          colors = ["rouge"]
          color =chooseRandom(numberToClass)

        }else{
          color =chooseRandom(numberToClass)
          if(colors.join(" ") != userSentence){
            this.tell("Vous avez perdu avec "+colors.length+" mots, vous avez dit "+userSentence+" vous devriez dire "+colors.join(" ") )
            return false;
          }
        }
        colors.push(color)
        this.setSessionAttribute('colors', colors);
        let speechBuild = this.speechBuilder()
        sentence += colors.join(" ")
        let colorsINT = Array(6*3)
        colorsINT.fill(0)
        let colorsINTDDD = []
        for (var i = 0; i <colors.length; i++) {
          colorsINT[i] = numberToClass[colors[i]]
        }
        while(colorsINT.length) colorsINTDDD.push(colorsINT.splice(0,6));
        let data = '[{"data": '+JSON.stringify(colorsINTDDD)+'}]'
        let uri = urlencondapiBase+"setPreciseState?seq="+data
        console.log(uri)
        let res = request('GET', uri);

        this.followUpState("color").ask(sentence)
      },
    }
});

module.exports.app = app;
