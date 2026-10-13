export const signup = (req, res) => {
  const { name, email, password } = req.body;

  const data = {
    name,
    email,
    password,
  };

  return res
    .status(201)
    .json({ status: true, message: "user registered successfully", data });
};
