const { spawn } = require("child_process");
const path = require("path");

exports.calculateCarbon = async (req, res) => {
  try {
    const { transport, electricity, fuel } = req.body;

    const pythonScript = path.join(__dirname, "../../ai/predict.py");

    const python = spawn("python", [
      pythonScript,
      transport.toString(),
      electricity.toString(),
      fuel.toString(),
    ]);

    let result = "";
    let error = "";

    python.stdout.on("data", (data) => {
      result += data.toString();
    });

    python.stderr.on("data", (data) => {
      error += data.toString();
    });

    python.on("close", (code) => {
      if (code !== 0) {
        console.error(error);

        return res.status(500).json({
          success: false,
          message: error,
        });
      }

      try {
        const prediction = JSON.parse(result);

        res.status(200).json({
          success: true,
          prediction,
        });
      } catch (err) {
        console.error(result);

        res.status(500).json({
          success: false,
          message: "Prediction failed",
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
