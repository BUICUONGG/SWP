import connectToDatabase from "../config/database.js";
import VaccineInventory from "../model/vaccineInventorySchema.js";
import { ObjectId } from "mongodb";
import "dotenv/config";

class VaccineService {
  async addVaccine(vaccineData) {
    try {
      const vaccine = new VaccineInventory(vaccineData);
      await vaccine.validate();
      const result = await connectToDatabase.vaccines.insertOne(vaccine);
      return { _id: result.insertedId, ...vaccineData };
    } catch (error) {
      console.error("Error adding vaccine:", error.message);
      throw new Error(error.message);
    }
  }

  async getVaccines() {
    try {
      const vaccines = await connectToDatabase.vaccines.find().toArray();
      return vaccines;
    } catch (error) {
      console.error("Error get vaccine:", error.message);
      throw new Error(error.message);
    }
  }

  async updateVaccine(vaccineData) {
    try {
      const { _id, ...updateData } = vaccineData;

      if (!_id) {
        throw new Error("Vaccine ID is required for update");
      }

      // Kiểm tra vaccine có tồn tại không
      const existingVaccine = await connectToDatabase.vaccines.findOne({
        _id: new ObjectId(_id),
      });

      if (!existingVaccine) {
        throw new Error("Vaccine not found");
      }

      // Cập nhật vaccine
      const result = await connectToDatabase.vaccines.updateOne(
        { _id: new ObjectId(_id) },
        { $set: updateData }
      );

      if (result.modifiedCount === 0) {
        throw new Error("No changes were made");
      }

      return { _id, ...updateData };
    } catch (error) {
      console.error("Error updating vaccine:", error.message);
      throw new Error(error.message);
    }
  }

  async deleteVaccine(vaccineId) {
    try {
      if (!vaccineId) {
        throw new Error("Vaccine ID is required for deletion");
      }

      // Kiểm tra vaccine có tồn tại không
      const existingVaccine = await connectToDatabase.vaccines.findOne({
        _id: new ObjectId(vaccineId),
      });

      if (!existingVaccine) {
        throw new Error("Vaccine not found");
      }

      // Cập nhật trạng thái vaccine về "out of stock"
      const result = await connectToDatabase.vaccines.updateOne(
        { _id: new ObjectId(vaccineId) },
        { $set: { status: "out of stock" } }
      );

      if (result.modifiedCount === 0) {
        throw new Error("Failed to update vaccine status");
      }

      // Lấy lại tài liệu đã được cập nhật
      const updatedVaccine = await connectToDatabase.vaccines.findOne({
        _id: new ObjectId(vaccineId),
      });

      return updatedVaccine;
    } catch (error) {
      console.error("Error deleting vaccine:", error.message);
      throw new Error(error.message);
    }
  }
}

const vaccineService = new VaccineService();
export default vaccineService;
