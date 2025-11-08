```mermaid
graph TD
    %% Define Nodes (Agents and Components)
    subgraph System_Input
        U[User Input/Prompt]
    end

    subgraph Agent_Architecture
        C(Coordinator Agent)
        R(Research Agent)
        P(Planning Agent)
        E(Evaluation Agent / Critic)
        S(Shared Knowledge Base/Memory)
    end

    subgraph External_Tools
        T1[Web Search Tool]
        T2[APIs/Databases]
    end

    subgraph System_Output
        O[Final Result/Output]
    end

    %% Define the Flow (Loop and Connections)
    U --> C
    C --> P
    C --> R
    C --> E

    P --> S
    R --> T1
    R --> T2
    E --> S
    E --> C

    %% The Main Loop/Iteration
    E -- Feedback Loop (Refine/Iterate) --> C

    R -- Results/Findings --> C
    P -- Plan/Strategy --> C

    C -- Synthesized Info --> O

    %% Explanation of the Loop
    style C fill:#f9f,stroke:#333,stroke-width:2px
    style R fill:#ccf,stroke:#333,stroke-width:2px
    style P fill:#cfc,stroke:#333,stroke-width:2px
    style E fill:#ffc,stroke:#333,stroke-width:2px

    note right of E: Loop continues until criteria met
```