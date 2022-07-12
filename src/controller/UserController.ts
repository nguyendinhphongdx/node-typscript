import { User } from "types/user";

class UserController {
    getUsers(req, res) {
        res.json([
            {
                id: 1,
                name: "John",
            },
            {
                id: 1,
                name: "John",
            },
            {
                id: 1,
                name: "John",
            }
        ])
    }
}
export default new UserController();