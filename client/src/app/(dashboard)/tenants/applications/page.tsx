"use client";

import ApplicationCard from "@/components/ApplicationCard";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { useGetApplicationsQuery, useGetAuthUserQuery } from "@/state/api";
import { CircleCheckBig, Clock, Download, XCircle } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";


const Applications = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const router = useRouter();
  const {
    data: applications,
    isLoading,
    isError,
  } = useGetApplicationsQuery({
    userId: authUser?.cognitoInfo?.userId,
    userType: "tenant",
  });

  if (isLoading) return <Loading />;
  if (isError || !applications) return <div>Error fetching applications</div>;

 
  const handlePayment = (leaseId?: string, price?: number) => {
    router.push(`/payment/${leaseId}?amount=${price}`)
  }

  return (
    <div className="dashboard-container">
      <Header
        title="Applications"
        subtitle="Track and manage your property rental applications"
      />
      <div className="w-full">
        {applications?.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            userType="renter"
          >
            <div className="flex justify-between gap-5 w-full pb-4 px-4">Message: {application.message}</div>
            <div className="flex justify-between gap-5 w-full pb-4 px-4">
              {application.status === "Approved" ? (
                <div className="bg-green-100 p-4 text-green-700 grow flex items-center">
                  <CircleCheckBig className="w-5 h-5 mr-2" />
                  The property is being rented by you until{" "}
                  {new Date(application.lease?.endDate).toLocaleDateString()}
                </div>
              ) : application.status === "Pending" ? (
                <div className="bg-yellow-100 p-4 text-yellow-700 grow flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Your application is pending approval
                </div>
              ) : (
                <div className="bg-red-100 p-4 text-red-700 grow flex items-center">
                  <XCircle className="w-5 h-5 mr-2" />
                  Your application has been denied
                </div>
              )}

             {application.status === "Approved" ? (<button
                className={`bg-green-500 border border-gray-300 text-white py-2 px-4
                          rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50`}
                 onClick={() => handlePayment(application.leaseId, application.property.pricePerMonth)}
              >
                Proceed to pay
              </button>) : application.status === "Pending" ? (
                <button
                className={`bg-white border border-gray-300 text-gray-700 py-2 px-4
                          rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50`}
              >
                <Download className="w-5 h-5 mr-2" />
                View property details 
              </button>
                ) : (
                  <button
                  className={`bg-red-600 border border-gray-300 text-white py-2 px-4
                            rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50`}
                >
                  Re-apply
                </button>
              )}
            </div>
          </ApplicationCard>
        ))}
      </div>
    </div>
  );
};

export default Applications;