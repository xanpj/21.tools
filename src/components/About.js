import React, { Component } from 'react';
import YouTube from 'react-youtube';

import * as CONSTANTS from '../constants'


function AboutInternal(props){
  const ytOpts = {
    playerVars: { // https://developers.google.com/youtube/player_parameters
      autoplay: 0,
      rel: 0,
      showinfo: 0,
      ecver: 0,
      modestbranding: 0,
      enablejsapi: 1,
      controls: 1,
      color: 'white',
      iv_load_policy: 3,
      origin:'http://localhost:3000' //TODO
    }
  }

  return <div id="AboutInternal">
            <YouTube
             videoId={"2GwzlT2M59A"}
             opts={ytOpts} />
         </div>
}

function Contact(props){
  return (
    <div>
      <h2>Contact</h2>
      <form action={"mailto:"+CONSTANTS.MAIL_OWNER+"?subject=Contact request"} method="post" enctype="text/plain" >
        <div class="custom_input">
            <input type="text" name="toolbox" placeholder="Subject" required={true} />
        </div>
        <div class="custom_input">
            <input type="email" name="email" placeholder="Email" required={true}/>
        </div>
        <div class="custom_input">
            <textarea type="text" name="content" placeholder="Content" />
        </div>
        <div class="submit_input">
            <button type="submit">Send Mail</button>
        </div>
      </form>
    </div>)
}

function Imprint(props){
  return  (
    <div id="Imprint">
    <h1>Legal Disclosure</h1>
      Information in accordance with Section 5 TMG<br />
      Owner: Alexander Jagaciak
      <h2>Contact Information</h2>
      E-Mail: <a href={"mailto:"+CONSTANTS.MAIL_OWNER}>{CONSTANTS.MAIL_OWNER}</a><br /><br /><br />
      <h2>Disclaimer</h2>
      Accountability for content<br />
      The contents of our pages have been created with the utmost care. However, we cannot guarantee the contents'
      accuracy, completeness or topicality. According to statutory provisions, we are furthermore responsible for
      our own content on these web pages. In this matter, please note that we are not obliged to monitor
      the transmitted or saved information of third parties, or investigate circumstances pointing to illegal activity.
      Our obligations to remove or block the use of information under generally applicable laws remain unaffected by this as per
      §§ 8 to 10 of the Telemedia Act (TMG).

      <br /><br />Accountability for links<br />
      Responsibility for the content of
      external links (to web pages of third parties) lies solely with the operators of the linked pages. No violations were
      evident to us at the time of linking. Should any legal infringement become known to us, we will remove the respective
      link immediately.<br /><br />Copyright<br /> Our web pages and their contents are subject to German copyright law. Unless
      expressly permitted by law, every form of utilizing, reproducing or processing
      works subject to copyright protection on our web pages requires the prior consent of the respective owner of the rights.
      Individual reproductions of a work are only allowed for private use.
      The materials from these pages are copyrighted and any unauthorized use may violate copyright laws.

      <br /><br />
    </div>)
}



class About extends Component {
  constructor(props){
    super(props)
    this.state = {
      view: null
    }
  }

  renderView(){
    if(this.state.view == CONSTANTS.VIEWS.ABOUT_INTERNAL.CONTACT){
      return (<Contact />)
    }
    if(this.state.view == CONSTANTS.VIEWS.ABOUT_INTERNAL.IMPRINT){
      return (<Imprint />)
    } else {
      return (<AboutInternal />)
    }
  }

  render() {
    return (
      <div id="About">
        <div class="outer">
        <div class="middle">
        <div class="inner">

          <div class="about-wrapper">
            <div class="container">
              <div class="row">
                <div class="col-md-4 about-btn-wrapper">
                  <div class={(this.state.view === null) ? "about-btn active" : "about-btn"} onClick={() => this.setState({view: null})} >About</div>
                </div>
                <div class="col-md-4 about-btn-wrapper">
                  <div class={(this.state.view === CONSTANTS.VIEWS.ABOUT_INTERNAL.CONTACT) ? "about-btn active" : "about-btn"} onClick={() => this.setState({view: CONSTANTS.VIEWS.ABOUT_INTERNAL.CONTACT})}>Contact</div>
                </div>
                <div class="col-md-4 about-btn-wrapper">
                  <div class={(this.state.view === CONSTANTS.VIEWS.ABOUT_INTERNAL.IMPRINT) ? "about-btn active" : "about-btn"} onClick={() => this.setState({view: CONSTANTS.VIEWS.ABOUT_INTERNAL.IMPRINT})}>Imprint</div>
                </div>
              </div>
              <div class="row seperator">
              <div class="container">
              {this.renderView()}
              </div>
              </div>
            </div>
          </div>

        </div>
        </div>
        </div>
      </div>
    );
  }
}

export default About;
