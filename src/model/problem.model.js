const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Problem = sequelize.define(
  "Problem",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    difficulty: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    topic: {
      type: DataTypes.STRING(120),
      allowNull: false,
      defaultValue: "Complex pipelines"
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    world: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    worldNumber: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    levelNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    worldLevelNumber: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    starterCode: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    hint: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    hintSteps: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    inputFormat: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "Input is provided through constants in starter code."
    },
    outputFormat: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "Return the expected object from solve()."
    },
    constraints: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "Prefer Stream API operations and avoid side effects."
    },
    examples: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    editorial: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "Build a clear stream pipeline and keep it readable."
    },
    optimizedSolution: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "// Optimized solution will be provided by admins."
    },
    acceptanceRate: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 60
    },
    popularity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    sampleTests: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    testCases: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    expectedOutput: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    xpReward: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 40
    },
    timeLimitMs: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5000
    },
    memoryLimitMb: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 128
    },
    isDaily: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isPracticeFeatured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isChallengeFeatured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    tableName: "problems"
  }
);

module.exports = Problem;
