

const codebolt = require('@codebolt/codeboltjs');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const axios = require('axios');




const {  createHighLevelPlan, getAPIComponentsList, determineRequiredComponents, getComponentDetails, generateCodeboltAgent, searchAPIComponents } = require('./generator');

codebolt.onMessage(async (reqMessage) => {

    try {
      // Step 1: Create high-level plan
      console.log('\n📋 Step 1: Creating high-level plan...');
      codebolt.chat.sendMessage("Creating high-level plan...");
      let userRequest = reqMessage.userMessage;
      const highLevelPlan = await createHighLevelPlan(userRequest);
      console.log('✅ High-level plan created');
      codebolt.chat.sendMessage(highLevelPlan);
    

      // Step 2: Get list of available API components
      console.log('\n🔍 Step 2: Fetching available API components...');
      codebolt.chat.sendMessage("Fetching available API components...");
      const apiComponents = await getAPIComponentsList();
      console.log(`✅ Found ${apiComponents.length} API components`);
      codebolt.chat.sendMessage(apiComponents);

      // Step 3: Determine required components based on plan
      console.log('\n🎯 Step 3: Determining required components...');
      codebolt.chat.sendMessage("Determining required components...");
      const requiredComponents = await determineRequiredComponents(highLevelPlan, apiComponents);
      codebolt.chat.sendMessage(requiredComponents);
      console.log(`✅ Identified ${requiredComponents.length} required components`);

      // Step 4: Get detailed information for required components
      console.log('\n📖 Step 4: Fetching component details...');
      codebolt.chat.sendMessage("Fetching component details...");
      const componentDetails = await getComponentDetails(requiredComponents);
      console.log('✅ Component details retrieved');
      codebolt.chat.sendMessage(componentDetails);

      // Step 5: Generate Codebolt AI agent
      console.log('\n🤖 Step 5: Generating Codebolt AI agent...');
      codebolt.chat.sendMessage("Generating Codebolt AI agent...");
      const codeboltAgent = await generateCodeboltAgent(userRequest, highLevelPlan, componentDetails);
      console.log(codeboltAgent);
      // codebolt.chat.sendMessage(codeboltAgent);
      console.log('✅ Codebolt AI agent generated successfully');

     

    } catch (error) {
      console.error('❌ Error generating agent:', error);
      throw error;
    }
});
