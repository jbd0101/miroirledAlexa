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
const apiBase = "http://c21cd0de.ngrok.io/api/v1/"

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
    }
});

module.exports.app = app;
