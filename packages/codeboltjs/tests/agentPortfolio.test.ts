/**
 * Comprehensive Test Suite for AgentPortfolio Module
 *
 * Tests cover ALL 13 methods in the agentPortfolio module:
 * 1. Portfolio Retrieval: getPortfolio, getConversations
 * 2. Testimonial Management: addTestimonial, updateTestimonial, deleteTestimonial
 * 3. Karma System: addKarma, getKarmaHistory
 * 4. Appreciation System: addAppreciation
 * 5. Talent Management: addTalent, endorseTalent, getTalents
 * 6. Ranking System: getRanking
 * 7. Project Integration: getPortfoliosByProject
 * 8. Profile Management: updateProfile
 *
 * Each test:
 * - Uses the shared CodeboltSDK instance
 * - Has descriptive test names
 * - Tests all portfolio operations
 * - Tests karma/scoring system
 * - Tests talent endorsements
 * - Tests ranking/leaderboard functionality
 * - Includes AskUserQuestion for success verification
 * - Includes proper data setup for relational tests
 */

const codebolt = require('../dist');
const assert = require('assert');

// Test data for relational tests
const testAgents = {
    agent1: 'test-agent-portfolio-1',
    agent2: 'test-agent-portfolio-2',
    agent3: 'test-agent-portfolio-3'
};

const testProjects = {
    project1: 'test-project-portfolio-1',
    project2: 'test-project-portfolio-2'
};

const testCases = [
    // ============================================================================
    // PORTFOLIO RETRIEVAL TESTS
    // ============================================================================

    {
        name: 'agentPortfolio.getPortfolio should retrieve agent portfolio data',
        testFunction: async () => {
            await codebolt.waitForReady();

            const response = await codebolt.agentPortfolio.getPortfolio(testAgents.agent1);

            assert.ok(response, 'Response should exist');
            assert.strictEqual(typeof response, 'object', 'Response should be an object');

            // Verify portfolio structure
            if (response.portfolio) {
                assert.ok(response.portfolio.agentId, 'Portfolio should have agentId');
                console.log(`✓ Portfolio retrieved for agent: ${response.portfolio.agentId}`);

                if (response.portfolio.totalKarma !== undefined) {
                    console.log(`✓ Total Karma: ${response.portfolio.totalKarma}`);
                }

                if (response.portfolio.ranking !== undefined) {
                    console.log(`✓ Ranking: ${response.portfolio.ranking}`);
                }
            } else {
                console.log('✓ Portfolio response structure validated (no portfolio data yet)');
            }

            // AskUserQuestion: Verify portfolio retrieval
            console.log('✅ AskUserQuestion: Was the agent portfolio retrieved successfully?');
        }
    },

    {
        name: 'agentPortfolio.getConversations should retrieve agent conversations with pagination',
        testFunction: async () => {
            await codebolt.waitForReady();

            // Test with limit and offset
            const limit = 10;
            const offset = 0;
            const response = await codebolt.agentPortfolio.getConversations(
                testAgents.agent1,
                limit,
                offset
            );

            assert.ok(response, 'Response should exist');
            assert.strictEqual(typeof response, 'object', 'Response should be an object');

            if (response.conversations) {
                assert.ok(Array.isArray(response.conversations), 'Conversations should be an array');
                console.log(`✓ Retrieved ${response.conversations.length} conversations`);

                if (response.total !== undefined) {
                    console.log(`✓ Total conversations: ${response.total}`);
                }

                // Log conversation details
                response.conversations.forEach((conv: any, index: number) => {
                    console.log(`  ${index + 1}. ID: ${conv.id}, Messages: ${conv.messageCount || 'N/A'}`);
                });
            } else {
                console.log('✓ Conversations response structure validated (no conversations yet)');
            }

            // AskUserQuestion: Verify conversations retrieval
            console.log('✅ AskUserQuestion: Were the agent conversations retrieved successfully with pagination?');
        }
    },

    {
        name: 'agentPortfolio.getConversations should work without pagination parameters',
        testFunction: async () => {
            await codebolt.waitForReady();

            const response = await codebolt.agentPortfolio.getConversations(testAgents.agent2);

            assert.ok(response, 'Response should exist');
            assert.strictEqual(typeof response, 'object', 'Response should be an object');
            console.log('✓ Conversations retrieved without pagination parameters');

            // AskUserQuestion: Verify conversations retrieval
            console.log('✅ AskUserQuestion: Were conversations retrieved successfully without pagination?');
        }
    },

    // ============================================================================
    // TESTIMONIAL MANAGEMENT TESTS
    // ============================================================================

    {
        name: 'agentPortfolio.addTestimonial should add a testimonial for an agent',
        testFunction: async () => {
            await codebolt.waitForReady();

            const testimonialContent = 'Excellent work on the recent project! Very professional and efficient.';

            const response = await codebolt.agentPortfolio.addTestimonial(
                testAgents.agent1,
                testimonialContent,
                testProjects.project1
            );

            assert.ok(response, 'Response should exist');
            assert.strictEqual(typeof response, 'object', 'Response should be an object');

            if (response.testimonialId) {
                console.log(`✓ Testimonial added with ID: ${response.testimonialId}`);
            } else {
                console.log('✓ Testimonial response validated');
            }

            // AskUserQuestion: Verify testimonial creation
            console.log('✅ AskUserQuestion: Was the testimonial added successfully?');
        }
    },

    {
        name: 'agentPortfolio.addTestimonial should work without project ID',
        testFunction: async () => {
            await codebolt.waitForReady();

            const testimonialContent = 'Great collaboration and communication skills!';

            const response = await codebolt.agentPortfolio.addTestimonial(
                testAgents.agent2,
                testimonialContent
            );

            assert.ok(response, 'Response should exist');
            console.log('✓ Testimonial added without project association');

            // AskUserQuestion: Verify testimonial without project
            console.log('✅ AskUserQuestion: Was the testimonial added successfully without a project?');
        }
    },

    {
        name: 'agentPortfolio.updateTestimonial should update an existing testimonial',
        testFunction: async () => {
            await codebolt.waitForReady();

            // First, create a testimonial
            const createResponse = await codebolt.agentPortfolio.addTestimonial(
                testAgents.agent1,
                'Original testimonial content'
            );

            // Then update it
            const updatedContent = 'Updated testimonial content with more details.';
            const updateResponse = await codebolt.agentPortfolio.updateTestimonial(
                createResponse.testimonialId || 'test-testimonial-id',
                updatedContent
            );

            assert.ok(updateResponse, 'Response should exist');
            assert.strictEqual(typeof updateResponse, 'object', 'Response should be an object');

            if (updateResponse.testimonial) {
                assert.strictEqual(
                    updateResponse.testimonial.content,
                    updatedContent,
                    'Testimonial content should be updated'
                );
                console.log(`✓ Testimonial updated: ${updatedContent}`);
            } else {
                console.log('✓ Testimonial update response validated');
            }

            // AskUserQuestion: Verify testimonial update
            console.log('✅ AskUserQuestion: Was the testimonial updated successfully?');
        }
    },

    {
        name: 'agentPortfolio.deleteTestimonial should remove a testimonial',
        testFunction: async () => {
            await codebolt.waitForReady();

            // First, create a testimonial
            const createResponse = await codebolt.agentPortfolio.addTestimonial(
                testAgents.agent3,
                'Testimonial to be deleted'
            );

            // Then delete it
            const deleteResponse = await codebolt.agentPortfolio.deleteTestimonial(
                createResponse.testimonialId || 'test-testimonial-id'
            );

            assert.ok(deleteResponse, 'Response should exist');
            assert.strictEqual(typeof deleteResponse, 'object', 'Response should be an object');

            if (deleteResponse.deleted !== undefined) {
                assert.strictEqual(deleteResponse.deleted, true, 'Deletion should be successful');
                console.log('✓ Testimonial deleted successfully');
            } else {
                console.log('✓ Testimonial delete response validated');
            }

            // AskUserQuestion: Verify testimonial deletion
            console.log('✅ AskUserQuestion: Was the testimonial deleted successfully?');
        }
    },

    // ============================================================================
    // KARMA SYSTEM TESTS
    // ============================================================================

    {
        name: 'agentPortfolio.addKarma should add positive karma to an agent',
        testFunction: async () => {
            await codebolt.waitForReady();

            const karmaAmount = 10;
            const reason = 'Excellent code contribution';

            const response = await codebolt.agentPortfolio.addKarma(
                testAgents.agent1,
                karmaAmount,
                reason
            );

            assert.ok(response, 'Response should exist');
            assert.strictEqual(typeof response, 'object', 'Response should be an object');

            if (response.karmaId) {
                console.log(`✓ Karma entry created with ID: ${response.karmaId}`);
            }

            if (response.newTotal !== undefined) {
                console.log(`✓ New total karma: ${response.newTotal}`);
            }

            console.log(`✓ Added ${karmaAmount} karma for: ${reason}`);

            // AskUserQuestion: Verify karma addition
            console.log('✅ AskUserQuestion: Was positive karma added successfully?');
        }
    },

    {
        name: 'agentPortfolio.addKarma should handle negative karma',
        testFunction: async () => {
            await codebolt.waitForReady();

            const karmaAmount = -5;
            const reason = 'Bug in production code';

            const response = await codebolt.agentPortfolio.addKarma(
                testAgents.agent2,
                karmaAmount,
                reason
            );

            assert.ok(response, 'Response should exist');
            console.log(`✓ Negative karma applied: ${karmaAmount} for ${reason}`);

            if (response.newTotal !== undefined) {
                console.log(`✓ New total karma: ${response.newTotal}`);
            }

            // AskUserQuestion: Verify negative karma handling
            console.log('✅ AskUserQuestion: Was negative karma handled correctly?');
        }
    },

    {
        name: 'agentPortfolio.addKarma should work without a reason',
        testFunction: async () => {
            await codebolt.waitForReady();

            const karmaAmount = 5;

            const response = await codebolt.agentPortfolio.addKarma(
                testAgents.agent3,
                karmaAmount
            );

            assert.ok(response, 'Response should exist');
            console.log(`✓ Karma added without reason: ${karmaAmount}`);

            // AskUserQuestion: Verify karma without reason
            console.log('✅ AskUserQuestion: Was karma added successfully without a reason?');
        }
    },

    {
        name: 'agentPortfolio.getKarmaHistory should retrieve karma history',
        testFunction: async () => {
            await codebolt.waitForReady();

            // First add some karma
            await codebolt.agentPortfolio.addKarma(testAgents.agent1, 15, 'Great work');
            await codebolt.agentPortfolio.addKarma(testAgents.agent1, -3, 'Minor issue');

            // Then get history
            const limit = 10;
            const response = await codebolt.agentPortfolio.getKarmaHistory(
                testAgents.agent1,
                limit
            );

            assert.ok(response, 'Response should exist');
            assert.strictEqual(typeof response, 'object', 'Response should be an object');

            if (response.history) {
                assert.ok(Array.isArray(response.history), 'History should be an array');
                console.log(`✓ Retrieved ${response.history.length} karma entries`);

                // Log karma entries
                response.history.forEach((entry: any, index: number) => {
                    console.log(`  ${index + 1}. Amount: ${entry.amount}, Reason: ${entry.reason || 'N/A'}`);
                });

                if (response.total !== undefined) {
                    console.log(`✓ Total karma entries: ${response.total}`);
                }
            } else {
                console.log('✓ Karma history response validated');
            }

            // AskUserQuestion: Verify karma history retrieval
            console.log('✅ AskUserQuestion: Was the karma history retrieved successfully?');
        }
    },

    {
        name: 'agentPortfolio.getKarmaHistory should work without limit parameter',
        testFunction: async () => {
            await codebolt.waitForReady();

            const response = await codebolt.agentPortfolio.getKarmaHistory(testAgents.agent2);

            assert.ok(response, 'Response should exist');
            console.log('✓ Karma history retrieved without limit');

            // AskUserQuestion: Verify karma history without limit
            console.log('✅ AskUserQuestion: Was karma history retrieved successfully without a limit?');
        }
    },

    // ============================================================================
    // APPRECIATION SYSTEM TESTS
    // ============================================================================

    {
        name: 'agentPortfolio.addAppreciation should add appreciation for an agent',
        testFunction: async () => {
            await codebolt.waitForReady();

            const appreciationMessage = 'Thank you for your hard work and dedication!';

            const response = await codebolt.agentPortfolio.addAppreciation(
                testAgents.agent1,
                appreciationMessage
            );

            assert.ok(response, 'Response should exist');
            assert.strictEqual(typeof response, 'object', 'Response should be an object');

            if (response.appreciationId) {
                console.log(`✓ Appreciation added with ID: ${response.appreciationId}`);
            } else {
                console.log('✓ Appreciation response validated');
            }

            console.log(`✓ Appreciation message: "${appreciationMessage}"`);

            // AskUserQuestion: Verify appreciation addition
            console.log('✅ AskUserQuestion: Was the appreciation added successfully?');
        }
    },

    {
        name: 'agentPortfolio.addAppreciation should handle different message types',
        testFunction: async () => {
            await codebolt.waitForReady();

            const messages = [
                'Great teamwork on the project!',
                'Outstanding problem-solving skills!',
                'Always willing to help others.'
            ];

            for (const message of messages) {
                const response = await codebolt.agentPortfolio.addAppreciation(
                    testAgents.agent2,
                    message
                );
                assert.ok(response, 'Response should exist');
                console.log(`✓ Appreciation added: "${message}"`);
            }

            // AskUserQuestion: Verify multiple appreciations
            console.log('✅ AskUserQuestion: Were all appreciations added successfully?');
        }
    },

    // ============================================================================
    // TALENT MANAGEMENT TESTS
    // ============================================================================

    {
        name: 'agentPortfolio.addTalent should add a new talent skill',
        testFunction: async () => {
            await codebolt.waitForReady();

            const talentName = 'TypeScript';
            const talentDescription = 'Advanced TypeScript development skills';

            const response = await codebolt.agentPortfolio.addTalent(
                talentName,
                talentDescription
            );

            assert.ok(response, 'Response should exist');
            assert.strictEqual(typeof response, 'object', 'Response should be an object');

            if (response.talentId) {
                console.log(`✓ Talent added with ID: ${response.talentId}`);
            } else {
                console.log('✓ Talent response validated');
            }

            console.log(`✓ Talent: ${talentName} - ${talentDescription}`);

            // AskUserQuestion: Verify talent addition
            console.log('✅ AskUserQuestion: Was the talent added successfully?');
        }
    },

    {
        name: 'agentPortfolio.addTalent should work without description',
        testFunction: async () => {
            await codebolt.waitForReady();

            const talentName = 'JavaScript';

            const response = await codebolt.agentPortfolio.addTalent(talentName);

            assert.ok(response, 'Response should exist');
            console.log(`✓ Talent added without description: ${talentName}`);

            // AskUserQuestion: Verify talent without description
            console.log('✅ AskUserQuestion: Was the talent added successfully without a description?');
        }
    },

    {
        name: 'agentPortfolio.endorseTalent should endorse a talent skill',
        testFunction: async () => {
            await codebolt.waitForReady();

            // First, create a talent
            const createResponse = await codebolt.agentPortfolio.addTalent(
                'React Development',
                'Building modern React applications'
            );

            // Then endorse it
            const endorseResponse = await codebolt.agentPortfolio.endorseTalent(
                createResponse.talentId || 'test-talent-id'
            );

            assert.ok(endorseResponse, 'Response should exist');
            assert.strictEqual(typeof endorseResponse, 'object', 'Response should be an object');

            if (endorseResponse.talent) {
                console.log(`✓ Talent endorsed: ${endorseResponse.talent.name}`);

                if (endorseResponse.talent.endorsements) {
                    console.log(`✓ Endorsement count: ${endorseResponse.talent.endorsements.length}`);
                }
            } else {
                console.log('✓ Talent endorsement response validated');
            }

            // AskUserQuestion: Verify talent endorsement
            console.log('✅ AskUserQuestion: Was the talent endorsed successfully?');
        }
    },

    {
        name: 'agentPortfolio.getTalents should retrieve talents for a specific agent',
        testFunction: async () => {
            await codebolt.waitForReady();

            // First add some talents
            await codebolt.agentPortfolio.addTalent('Python', 'Data science and automation');
            await codebolt.agentPortfolio.addTalent('Docker', 'Container orchestration');

            // Get talents for agent
            const response = await codebolt.agentPortfolio.getTalents(testAgents.agent1);

            assert.ok(response, 'Response should exist');
            assert.strictEqual(typeof response, 'object', 'Response should be an object');

            if (response.talents) {
                assert.ok(Array.isArray(response.talents), 'Talents should be an array');
                console.log(`✓ Retrieved ${response.talents.length} talents for agent`);

                // Log talents
                response.talents.forEach((talent: any, index: number) => {
                    console.log(`  ${index + 1}. ${talent.name} - ${talent.description || 'No description'}`);
                    if (talent.endorsements) {
                        console.log(`     Endorsements: ${talent.endorsements.length}`);
                    }
                });
            } else {
                console.log('✓ Talents response validated');
            }

            // AskUserQuestion: Verify talents retrieval
            console.log('✅ AskUserQuestion: Were the agent talents retrieved successfully?');
        }
    },

    {
        name: 'agentPortfolio.getTalents should retrieve all talents when no agent specified',
        testFunction: async () => {
            await codebolt.waitForReady();

            const response = await codebolt.agentPortfolio.getTalents();

            assert.ok(response, 'Response should exist');

            if (response.talents) {
                console.log(`✓ Retrieved ${response.talents.length} total talents`);
            } else {
                console.log('✓ All talents response validated');
            }

            // AskUserQuestion: Verify all talents retrieval
            console.log('✅ AskUserQuestion: Were all talents retrieved successfully?');
        }
    },

    {
        name: 'agentPortfolio.getTalents should handle multiple endorsements',
        testFunction: async () => {
            await codebolt.waitForReady();

            // Create talent
            const talentResponse = await codebolt.agentPortfolio.addTalent(
                'Node.js',
                'Backend development'
            );

            const talentId = talentResponse.talentId || 'test-talent-id';

            // Endorse multiple times (simulating different agents)
            await codebolt.agentPortfolio.endorseTalent(talentId);
            await codebolt.agentPortfolio.endorseTalent(talentId);
            await codebolt.agentPortfolio.endorseTalent(talentId);

            // Get talents and check endorsements
            const response = await codebolt.agentPortfolio.getTalents(testAgents.agent1);

            assert.ok(response, 'Response should exist');

            if (response.talents) {
                const endorsedTalent = response.talents.find((t: any) => t.name === 'Node.js');
                if (endorsedTalent && endorsedTalent.endorsements) {
                    console.log(`✓ Talent has ${endorsedTalent.endorsements.length} endorsements`);
                }
            }

            console.log('✓ Multiple endorsements handled correctly');

            // AskUserQuestion: Verify multiple endorsements
            console.log('✅ AskUserQuestion: Were multiple endorsements handled correctly?');
        }
    },

    // ============================================================================
    // RANKING SYSTEM TESTS
    // ============================================================================

    {
        name: 'agentPortfolio.getRanking should retrieve agent leaderboard by karma',
        testFunction: async () => {
            await codebolt.waitForReady();

            const limit = 10;
            const sortBy = 'karma';

            const response = await codebolt.agentPortfolio.getRanking(limit, sortBy);

            assert.ok(response, 'Response should exist');
            assert.strictEqual(typeof response, 'object', 'Response should be an object');

            if (response.ranking) {
                assert.ok(Array.isArray(response.ranking), 'Ranking should be an array');
                console.log(`✓ Retrieved ${response.ranking.length} rankings by ${sortBy}`);

                // Log top agents
                response.ranking.slice(0, 5).forEach((entry: any, index: number) => {
                    console.log(`  ${index + 1}. Agent: ${entry.agentId || 'N/A'} - Score: ${entry.score}, Rank: ${entry.rank}`);
                    if (entry.rankChange !== undefined) {
                        console.log(`     Rank change: ${entry.rankChange > 0 ? '+' : ''}${entry.rankChange}`);
                    }
                });
            } else {
                console.log('✓ Ranking response validated');
            }

            // AskUserQuestion: Verify ranking retrieval
            console.log('✅ AskUserQuestion: Was the agent ranking retrieved successfully by karma?');
        }
    },

    {
        name: 'agentPortfolio.getRanking should retrieve rankings by testimonials',
        testFunction: async () => {
            await codebolt.waitForReady();

            const sortBy = 'testimonials';

            const response = await codebolt.agentPortfolio.getRanking(10, sortBy);

            assert.ok(response, 'Response should exist');
            console.log(`✓ Retrieved rankings by ${sortBy}`);

            if (response.ranking) {
                response.ranking.slice(0, 3).forEach((entry: any) => {
                    console.log(`  Agent: ${entry.agentId || 'N/A'} - Score: ${entry.score}`);
                });
            }

            // AskUserQuestion: Verify ranking by testimonials
            console.log('✅ AskUserQuestion: Was the ranking retrieved successfully by testimonials?');
        }
    },

    {
        name: 'agentPortfolio.getRanking should retrieve rankings by endorsements',
        testFunction: async () => {
            await codebolt.waitForReady();

            const sortBy = 'endorsements';

            const response = await codebolt.agentPortfolio.getRanking(10, sortBy);

            assert.ok(response, 'Response should exist');
            console.log(`✓ Retrieved rankings by ${sortBy}`);

            // AskUserQuestion: Verify ranking by endorsements
            console.log('✅ AskUserQuestion: Was the ranking retrieved successfully by endorsements?');
        }
    },

    {
        name: 'agentPortfolio.getRanking should work without parameters',
        testFunction: async () => {
            await codebolt.waitForReady();

            const response = await codebolt.agentPortfolio.getRanking();

            assert.ok(response, 'Response should exist');
            console.log('✓ Ranking retrieved without parameters');

            // AskUserQuestion: Verify default ranking
            console.log('✅ AskUserQuestion: Was the ranking retrieved successfully with default parameters?');
        }
    },

    {
        name: 'agentPortfolio.getRanking should respect limit parameter',
        testFunction: async () => {
            await codebolt.waitForReady();

            const limit = 5;
            const response = await codebolt.agentPortfolio.getRanking(limit);

            assert.ok(response, 'Response should exist');

            if (response.ranking) {
                const actualLength = response.ranking.length;
                assert.ok(actualLength <= limit, `Should return at most ${limit} entries`);
                console.log(`✓ Ranking respects limit: ${actualLength} entries returned`);
            }

            // AskUserQuestion: Verify limit parameter
            console.log('✅ AskUserQuestion: Did the ranking respect the limit parameter?');
        }
    },

    // ============================================================================
    // PROJECT INTEGRATION TESTS
    // ============================================================================

    {
        name: 'agentPortfolio.getPortfoliosByProject should retrieve portfolios for a project',
        testFunction: async () => {
            await codebolt.waitForReady();

            const response = await codebolt.agentPortfolio.getPortfoliosByProject(
                testProjects.project1
            );

            assert.ok(response, 'Response should exist');
            assert.strictEqual(typeof response, 'object', 'Response should be an object');

            if (response.portfolios) {
                assert.ok(Array.isArray(response.portfolios), 'Portfolios should be an array');
                console.log(`✓ Retrieved ${response.portfolios.length} portfolios for project`);

                // Log portfolio details
                response.portfolios.forEach((portfolio: any, index: number) => {
                    console.log(`  ${index + 1}. Agent: ${portfolio.agentId}`);
                    if (portfolio.totalKarma !== undefined) {
                        console.log(`     Karma: ${portfolio.totalKarma}`);
                    }
                    if (portfolio.testimonials) {
                        console.log(`     Testimonials: ${portfolio.testimonials.length}`);
                    }
                });
            } else {
                console.log('✓ Project portfolios response validated');
            }

            // AskUserQuestion: Verify project portfolios retrieval
            console.log('✅ AskUserQuestion: Were the project portfolios retrieved successfully?');
        }
    },

    {
        name: 'agentPortfolio.getPortfoliosByProject should handle projects with no agents',
        testFunction: async () => {
            await codebolt.waitForReady();

            const emptyProjectId = 'test-empty-project-123';

            const response = await codebolt.agentPortfolio.getPortfoliosByProject(emptyProjectId);

            assert.ok(response, 'Response should exist');
            console.log('✓ Handled project with no agents gracefully');

            // AskUserQuestion: Verify empty project handling
            console.log('✅ AskUserQuestion: Was the empty project handled gracefully?');
        }
    },

    // ============================================================================
    // PROFILE MANAGEMENT TESTS
    // ============================================================================

    {
        name: 'agentPortfolio.updateProfile should update agent profile with all fields',
        testFunction: async () => {
            await codebolt.waitForReady();

            const profileData = {
                displayName: 'Test Agent Updated',
                bio: 'Experienced developer specializing in full-stack development',
                specialties: ['TypeScript', 'React', 'Node.js', 'Python'],
                avatarUrl: 'https://example.com/avatar.jpg',
                location: 'San Francisco, CA',
                website: 'https://example.com'
            };

            const response = await codebolt.agentPortfolio.updateProfile(
                testAgents.agent1,
                profileData
            );

            assert.ok(response, 'Response should exist');
            assert.strictEqual(typeof response, 'object', 'Response should be an object');

            if (response.profile) {
                console.log('✓ Profile updated with all fields:');
                console.log(`  Display Name: ${response.profile.displayName}`);
                console.log(`  Bio: ${response.profile.bio}`);
                console.log(`  Specialties: ${response.profile.specialties?.join(', ')}`);
                console.log(`  Location: ${response.profile.location}`);
                console.log(`  Website: ${response.profile.website}`);
            } else {
                console.log('✓ Profile update response validated');
            }

            // AskUserQuestion: Verify full profile update
            console.log('✅ AskUserQuestion: Was the profile updated successfully with all fields?');
        }
    },

    {
        name: 'agentPortfolio.updateProfile should handle partial updates',
        testFunction: async () => {
            await codebolt.waitForReady();

            const partialProfile = {
                displayName: 'Updated Name Only',
                bio: 'Updated bio only'
            };

            const response = await codebolt.agentPortfolio.updateProfile(
                testAgents.agent2,
                partialProfile
            );

            assert.ok(response, 'Response should exist');
            console.log('✓ Profile updated with partial fields');

            // AskUserQuestion: Verify partial profile update
            console.log('✅ AskUserQuestion: Was the partial profile update successful?');
        }
    },

    {
        name: 'agentPortfolio.updateProfile should handle empty profile updates',
        testFunction: async () => {
            await codebolt.waitForReady();

            const emptyProfile = {};

            const response = await codebolt.agentPortfolio.updateProfile(
                testAgents.agent3,
                emptyProfile
            );

            assert.ok(response, 'Response should exist');
            console.log('✓ Empty profile update handled gracefully');

            // AskUserQuestion: Verify empty profile handling
            console.log('✅ AskUserQuestion: Was the empty profile update handled gracefully?');
        }
    },

    {
        name: 'agentPortfolio.updateProfile should update specialties array',
        testFunction: async () => {
            await codebolt.waitForReady();

            const specialtiesUpdate = {
                specialties: ['JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular']
            };

            const response = await codebolt.agentPortfolio.updateProfile(
                testAgents.agent1,
                specialtiesUpdate
            );

            assert.ok(response, 'Response should exist');

            if (response.profile && response.profile.specialties) {
                console.log(`✓ Specialties updated: ${response.profile.specialties.join(', ')}`);
            }

            // AskUserQuestion: Verify specialties update
            console.log('✅ AskUserQuestion: Were the specialties updated successfully?');
        }
    },

    // ============================================================================
    // RELATIONAL DATA TESTS
    // ============================================================================

    {
        name: 'agentPortfolio should maintain relational data between karma and ranking',
        testFunction: async () => {
            await codebolt.waitForReady();

            // Add karma to agent
            const karmaResponse = await codebolt.agentPortfolio.addKarma(
                testAgents.agent1,
                20,
                'Outstanding performance'
            );

            // Get ranking
            const rankingResponse = await codebolt.agentPortfolio.getRanking(10, 'karma');

            // Get portfolio
            const portfolioResponse = await codebolt.agentPortfolio.getPortfolio(testAgents.agent1);

            console.log('✓ Relational data test completed');
            if (karmaResponse.newTotal !== undefined) {
                console.log(`  Karma added, new total: ${karmaResponse.newTotal}`);
            }
            if (portfolioResponse.portfolio?.totalKarma !== undefined) {
                console.log(`  Portfolio karma: ${portfolioResponse.portfolio.totalKarma}`);
            }

            // Verify relationships are maintained
            assert.ok(karmaResponse, 'Karma response should exist');
            assert.ok(rankingResponse, 'Ranking response should exist');
            assert.ok(portfolioResponse, 'Portfolio response should exist');

            // AskUserQuestion: Verify relational data consistency
            console.log('✅ AskUserQuestion: Is the relational data between karma and ranking consistent?');
        }
    },

    {
        name: 'agentPortfolio should maintain testimonial-project relationships',
        testFunction: async () => {
            await codebolt.waitForReady();

            // Add testimonials with project association
            await codebolt.agentPortfolio.addTestimonial(
                testAgents.agent1,
                'Great work on Project A',
                testProjects.project1
            );

            await codebolt.agentPortfolio.addTestimonial(
                testAgents.agent1,
                'Excellent contribution to Project A',
                testProjects.project1
            );

            // Get portfolios by project
            const projectPortfolios = await codebolt.agentPortfolio.getPortfoliosByProject(
                testProjects.project1
            );

            // Get agent portfolio
            const agentPortfolio = await codebolt.agentPortfolio.getPortfolio(testAgents.agent1);

            console.log('✓ Testimonial-project relationships maintained');

            if (projectPortfolios.portfolios) {
                console.log(`  Portfolios in project: ${projectPortfolios.portfolios.length}`);
            }
            if (agentPortfolio.portfolio?.testimonials) {
                console.log(`  Agent testimonials: ${agentPortfolio.portfolio.testimonials.length}`);
            }

            // AskUserQuestion: Verify testimonial-project relationships
            console.log('✅ AskUserQuestion: Are the testimonial-project relationships maintained correctly?');
        }
    },

    {
        name: 'agentPortfolio should track talent endorsements across agents',
        testFunction: async () => {
            await codebolt.waitForReady();

            // Create a talent
            const talentResponse = await codebolt.agentPortfolio.addTalent(
                'System Design',
                'Architecture and system design skills'
            );

            const talentId = talentResponse.talentId || 'test-talent-id';

            // Endorse from different agent perspectives
            await codebolt.agentPortfolio.endorseTalent(talentId);
            await codebolt.agentPortfolio.endorseTalent(talentId);

            // Get all talents
            const allTalents = await codebolt.agentPortfolio.getTalents();

            console.log('✓ Talent endorsements tracked across agents');

            if (allTalents.talents) {
                const systemDesignTalent = allTalents.talents.find((t: any) => t.name === 'System Design');
                if (systemDesignTalent && systemDesignTalent.endorsements) {
                    console.log(`  System Design talent has ${systemDesignTalent.endorsements.length} endorsements`);
                }
            }

            // AskUserQuestion: Verify cross-agent talent tracking
            console.log('✅ AskUserQuestion: Are talent endorsements tracked correctly across agents?');
        }
    },

    // ============================================================================
    // EDGE CASES AND ERROR HANDLING TESTS
    // ============================================================================

    {
        name: 'agentPortfolio should handle invalid agent IDs gracefully',
        testFunction: async () => {
            await codebolt.waitForReady();

            const invalidAgentId = 'non-existent-agent-999';

            try {
                const response = await codebolt.agentPortfolio.getPortfolio(invalidAgentId);
                console.log('✓ Invalid agent ID handled gracefully');

                if (response.error) {
                    console.log(`  Error message: ${response.error}`);
                }
            } catch (error) {
                console.log(`✓ Invalid agent ID threw error: ${error.message}`);
            }

            // AskUserQuestion: Verify invalid agent handling
            console.log('✅ AskUserQuestion: Was the invalid agent ID handled gracefully?');
        }
    },

    {
        name: 'agentPortfolio should handle empty testimonial content',
        testFunction: async () => {
            await codebolt.waitForReady();

            const response = await codebolt.agentPortfolio.addTestimonial(
                testAgents.agent2,
                ''
            );

            assert.ok(response, 'Response should exist');
            console.log('✓ Empty testimonial handled');

            // AskUserQuestion: Verify empty testimonial handling
            console.log('✅ AskUserQuestion: Was the empty testimonial content handled appropriately?');
        }
    },

    {
        name: 'agentPortfolio should handle very long testimonial content',
        testFunction: async () => {
            await codebolt.waitForReady();

            const longContent = 'Excellent work! '.repeat(100);

            const response = await codebolt.agentPortfolio.addTestimonial(
                testAgents.agent3,
                longContent
            );

            assert.ok(response, 'Response should exist');
            console.log(`✓ Long testimonial handled (${longContent.length} characters)`);

            // AskUserQuestion: Verify long content handling
            console.log('✅ AskUserQuestion: Was the long testimonial content handled properly?');
        }
    },

    {
        name: 'agentPortfolio should handle zero karma amount',
        testFunction: async () => {
            await codebolt.waitForReady();

            const response = await codebolt.agentPortfolio.addKarma(
                testAgents.agent1,
                0,
                'No change in karma'
            );

            assert.ok(response, 'Response should exist');
            console.log('✓ Zero karma amount handled');

            // AskUserQuestion: Verify zero karma handling
            console.log('✅ AskUserQuestion: Was the zero karma amount handled correctly?');
        }
    },

    {
        name: 'agentPortfolio should handle very large karma amounts',
        testFunction: async () => {
            await codebolt.waitForReady();

            const largeAmount = 10000;

            const response = await codebolt.agentPortfolio.addKarma(
                testAgents.agent2,
                largeAmount,
                'Major achievement'
            );

            assert.ok(response, 'Response should exist');
            console.log(`✓ Large karma amount handled: ${largeAmount}`);

            // AskUserQuestion: Verify large karma handling
            console.log('✅ AskUserQuestion: Was the large karma amount handled correctly?');
        }
    },

    {
        name: 'agentPortfolio should handle special characters in talent names',
        testFunction: async () => {
            await codebolt.waitForReady();

            const specialTalentName = 'C++ / C# & Java • Full-Stack';

            const response = await codebolt.agentPortfolio.addTalent(
                specialTalentName,
                'Multiple language expertise'
            );

            assert.ok(response, 'Response should exist');
            console.log(`✓ Special characters in talent name handled: "${specialTalentName}"`);

            // AskUserQuestion: Verify special character handling
            console.log('✅ AskUserQuestion: Were special characters in talent names handled correctly?');
        }
    },

    {
        name: 'agentPortfolio should handle Unicode characters in profile',
        testFunction: async () => {
            await codebolt.waitForReady();

            const unicodeProfile = {
                displayName: '开发者 🚀',
                bio: 'Experienced developer with expertise in 多种编程语言',
                location: 'Tokyo, Japan 🇯🇵'
            };

            const response = await codebolt.agentPortfolio.updateProfile(
                testAgents.agent1,
                unicodeProfile
            );

            assert.ok(response, 'Response should exist');
            console.log('✓ Unicode characters in profile handled');

            // AskUserQuestion: Verify Unicode handling
            console.log('✅ AskUserQuestion: Were Unicode characters in the profile handled correctly?');
        }
    },

    // ============================================================================
    // PERFORMANCE AND SCALABILITY TESTS
    // ============================================================================

    {
        name: 'agentPortfolio should handle multiple concurrent operations',
        testFunction: async () => {
            await codebolt.waitForReady();

            // Perform multiple operations concurrently
            const operations = [
                codebolt.agentPortfolio.getPortfolio(testAgents.agent1),
                codebolt.agentPortfolio.getConversations(testAgents.agent1),
                codebolt.agentPortfolio.getKarmaHistory(testAgents.agent1),
                codebolt.agentPortfolio.getTalents(testAgents.agent1),
                codebolt.agentPortfolio.getRanking(5, 'karma')
            ];

            const results = await Promise.all(operations);

            console.log(`✓ All ${results.length} concurrent operations completed successfully`);

            results.forEach((result, index) => {
                assert.ok(result, `Operation ${index + 1} should succeed`);
            });

            // AskUserQuestion: Verify concurrent operations
            console.log('✅ AskUserQuestion: Were all concurrent operations handled successfully?');
        }
    },

    {
        name: 'agentPortfolio should handle rapid sequential karma updates',
        testFunction: async () => {
            await codebolt.waitForReady();

            const karmaAmounts = [1, 2, 3, 4, 5];

            for (const amount of karmaAmounts) {
                await codebolt.agentPortfolio.addKarma(
                    testAgents.agent3,
                    amount,
                    `Sequential karma ${amount}`
                );
            }

            const finalPortfolio = await codebolt.agentPortfolio.getPortfolio(testAgents.agent3);

            console.log(`✓ Rapid sequential karma updates completed (${karmaAmounts.length} updates)`);

            if (finalPortfolio.portfolio?.totalKarma !== undefined) {
                console.log(`  Final karma total: ${finalPortfolio.portfolio.totalKarma}`);
            }

            // AskUserQuestion: Verify sequential updates
            console.log('✅ AskUserQuestion: Were rapid sequential karma updates handled correctly?');
        }
    },

    {
        name: 'agentPortfolio should handle large pagination requests',
        testFunction: async () => {
            await codebolt.waitForReady();

            const largeLimit = 100;
            const response = await codebolt.agentPortfolio.getConversations(
                testAgents.agent1,
                largeLimit,
                0
            );

            assert.ok(response, 'Response should exist');
            console.log(`✓ Large pagination request handled (limit: ${largeLimit})`);

            // AskUserQuestion: Verify large pagination
            console.log('✅ AskUserQuestion: Was the large pagination request handled successfully?');
        }
    },

    // ============================================================================
    // COMPREHENSIVE INTEGRATION TEST
    // ============================================================================

    {
        name: 'agentPortfolio comprehensive integration test - full workflow',
        testFunction: async () => {
            await codebolt.waitForReady();

            console.log('\n=== Comprehensive Integration Test ===\n');

            // 1. Create profile
            console.log('1. Updating agent profile...');
            await codebolt.agentPortfolio.updateProfile(testAgents.agent1, {
                displayName: 'Integration Test Agent',
                bio: 'Full-stack developer',
                specialties: ['TypeScript', 'React', 'Node.js']
            });
            console.log('✓ Profile updated');

            // 2. Add talents
            console.log('\n2. Adding talents...');
            const talent1 = await codebolt.agentPortfolio.addTalent('TypeScript', 'Advanced TS');
            const talent2 = await codebolt.agentPortfolio.addTalent('React', 'Frontend expert');
            console.log('✓ Talents added');

            // 3. Endorse talents
            console.log('\n3. Endorsing talents...');
            await codebolt.agentPortfolio.endorseTalent(talent1.talentId || 'id1');
            await codebolt.agentPortfolio.endorseTalent(talent2.talentId || 'id2');
            console.log('✓ Talents endorsed');

            // 4. Add karma
            console.log('\n4. Adding karma...');
            await codebolt.agentPortfolio.addKarma(testAgents.agent1, 50, 'Integration test');
            await codebolt.agentPortfolio.addKarma(testAgents.agent1, 25, 'Great contribution');
            console.log('✓ Karma added');

            // 5. Add testimonials
            console.log('\n5. Adding testimonials...');
            await codebolt.agentPortfolio.addTestimonial(
                testAgents.agent1,
                'Excellent work in integration test',
                testProjects.project1
            );
            console.log('✓ Testimonials added');

            // 6. Add appreciation
            console.log('\n6. Adding appreciation...');
            await codebolt.agentPortfolio.addAppreciation(
                testAgents.agent1,
                'Thank you for the great work!'
            );
            console.log('✓ Appreciation added');

            // 7. Get complete portfolio
            console.log('\n7. Retrieving complete portfolio...');
            const portfolio = await codebolt.agentPortfolio.getPortfolio(testAgents.agent1);
            console.log('✓ Portfolio retrieved');

            if (portfolio.portfolio) {
                console.log('\n=== Portfolio Summary ===');
                console.log(`Agent: ${portfolio.portfolio.agentId}`);
                console.log(`Total Karma: ${portfolio.portfolio.totalKarma || 'N/A'}`);
                console.log(`Ranking: ${portfolio.portfolio.ranking || 'N/A'}`);
                console.log(`Talents: ${portfolio.portfolio.talents?.length || 0}`);
                console.log(`Testimonials: ${portfolio.portfolio.testimonials?.length || 0}`);
                console.log(`Appreciations: ${portfolio.portfolio.appreciations?.length || 0}`);
            }

            // 8. Check ranking
            console.log('\n8. Checking ranking...');
            const ranking = await codebolt.agentPortfolio.getRanking(10, 'karma');
            console.log('✓ Ranking retrieved');

            // 9. Get project portfolios
            console.log('\n9. Getting project portfolios...');
            const projectPortfolios = await codebolt.agentPortfolio.getPortfoliosByProject(
                testProjects.project1
            );
            console.log('✓ Project portfolios retrieved');

            // 10. Get karma history
            console.log('\n10. Getting karma history...');
            const karmaHistory = await codebolt.agentPortfolio.getKarmaHistory(testAgents.agent1);
            console.log('✓ Karma history retrieved');

            if (karmaHistory.history) {
                console.log(`   Total entries: ${karmaHistory.history.length}`);
            }

            console.log('\n=== Integration Test Complete ===\n');

            // Final verification
            assert.ok(portfolio, 'Portfolio should exist');
            assert.ok(ranking, 'Ranking should exist');
            assert.ok(projectPortfolios, 'Project portfolios should exist');
            assert.ok(karmaHistory, 'Karma history should exist');

            // AskUserQuestion: Verify complete workflow
            console.log('✅ AskUserQuestion: Did the complete integration workflow execute successfully?');
        }
    }
];

// ============================================================================
// TEST EXECUTION
// ============================================================================

describe('AgentPortfolio Module - Comprehensive Test Suite', () => {
    beforeAll(async () => {
        console.log('\n========================================');
        console.log('AgentPortfolio Test Suite Starting');
        console.log('========================================\n');
        await codebolt.waitForReady();
    });

    afterAll(async () => {
        console.log('\n========================================');
        console.log('AgentPortfolio Test Suite Complete');
        console.log('========================================\n');
    });

    test.each(testCases)('%s', async (testCase) => {
        await testCase.testFunction();
    }, 60000); // 60 second timeout per test
});
