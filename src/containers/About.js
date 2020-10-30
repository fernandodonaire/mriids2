import React, {Component} from 'react';
import * as Styled from "../components/styled-components/About";
class About extends Component {
  render() {

    return (
      <div>
	    <Styled.Title>About</Styled.Title>

<Styled.Body>The International Society for Infectious Diseases (ISID), along with partners at ProMED, the Medical Research Council (MRC) Centre for Outbreak Analysis and Modeling at Imperial College London, the University of Sussex (UK), HealthMap at Boston Children’s Hospital/Harvard Medical School, and healthsites.io, developed a user-friendly tool to both forecast case counts during infectious disease outbreaks and estimate the risk of infectious disease cases arriving from and departing to specific geographic areas. The project — Mapping the Risk of International Infectious Disease Spread — MRIIDS — assessed outbreak events reported on ProMED and HealthMap by combining multiple data streams into a single probabilistic framework. Disease outbreak information is assessed with automated intelligence capabilities that incorporates population density information to estimate the number of cases for specific outbreak events. Additionally, the algorithm provides a risk projection to describe where infectious diseases cases are most likely to arrive from and depart to for specific countries. The information generated by the platform is accessible free of charge and incorporated into a platform with extensive end-user testing.</Styled.Body> 

<Styled.Body>Developed based on data from the 2014-16 West Africa Ebola outbreak, the MRIIDS prototype was designed to be rapidly scalable by extending it to pathogens of significance to humans and animals on a global scale. The tool aims to inform key health decision-makers at national and regional levels of the risks of an outbreak spreading in real-time, and aids government and non-governmental decision-makers as they prepare for the possible arrival of an infectious disease threat to their region.</Styled.Body>
 
<Styled.Body>The information technology resources developed for MRIIDS are hosted on a public GitHub account which is accessible to all interested parties. Thus, information developed for the program is not stored behind corporate walls and can be used by other organizations to further protect patient health.</Styled.Body> 

<Styled.Body>Initial funding and development support for the MRIIDS program was provided by the United States Agency for International Development - USAID - through the “Combating Zika and Future Threats” grant challenge. </Styled.Body>

<Styled.Body>In 2020, MRIIDS entered into the second phase of development with a $1.4-million grant from a philanthropic organization. MRIIDS 2.0 will build upon the success of the initial program and expand capabilities for infectious disease outbreak forecasting. The enhanced platform will incorporate new data streams such as personal mobility data, flight data, and new pathogens to improve the model’s applicability to new settings. In phase two, the existing research team will initially focus efforts on COVID-19 case predictions to assist the international response to the ongoing pandemic. Throughout this second phase of development, the updated platform will remain freely accessible to the public and all updates will be communicated on the program’s website. </Styled.Body>

	    </div>
    );
  }
}

export default About;
