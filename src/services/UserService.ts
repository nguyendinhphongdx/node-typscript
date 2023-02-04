
import { UserModel } from '../entities';
import { CountAll, UserProps } from 'types';

class UserService {
    async createUser(email: string, password: string): Promise<UserProps> {
        try {
            const user = await UserModel.findOne({ where: { email } });
            if (user) throw new Error(`User ${email} already exists`);
            const created = await UserModel.create({ email, password });
            return created;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    async getUsers(condition?: any): Promise<CountAll<UserProps>> {
        try {
            const users = await UserModel.findAndCountAll(condition);
            return users;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    async updateUser(userProps?: UserProps): Promise<UserProps> {
        try {
            const user = await UserModel.findOne({ where: { id: userProps.id } });
            if (!user) throw new Error(`User ${userProps.id} does not exist`);
            const result = await user.update({
                ...userProps,
            });
            return result;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    async deleteUser(userId: number): Promise<void> {
        try {
            const user = await UserModel.findOne({ where: { id: userId } });
            if (!user) throw new Error(`User ${userId} does not exist`);
            const result = await user.destroy();
            return result;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
export default new UserService();