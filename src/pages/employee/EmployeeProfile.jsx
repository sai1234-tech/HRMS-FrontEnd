import EmployeeHeader from "../../components/employee/EmployeeHeader";
import EmployeeProfileCard from "../../components/employee/EmployeeProfile";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { useEmployee } from "../../hooks/useEmployee";
import "../../styles/employee/profile.css";

function EmployeeProfile() {
	const { employee, loading, error, reload } = useEmployee();
	return <><EmployeeHeader /><main className="employee-page"><h1>My profile</h1>{loading ? <Loader /> : error ? <ErrorMessage message={error} onRetry={reload} /> : <EmployeeProfileCard employee={employee} />}</main></>;
}

export default EmployeeProfile;
