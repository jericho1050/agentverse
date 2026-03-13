// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

contract AgentEscrow {
    enum JobStatus { Funded, Completed, Refunded }

    struct Job {
        address requester;
        address provider;
        uint256 amount;
        JobStatus status;
        uint256 deadline;
    }

    uint256 public nextJobId = 1;
    mapping(uint256 => Job) public jobs;

    event JobCreated(uint256 indexed jobId, address requester, address provider, uint256 amount);
    event JobCompleted(uint256 indexed jobId, uint256 amount);
    event JobRefunded(uint256 indexed jobId);

    function createJob(address _provider, uint256 _deadline) external payable returns (uint256) {
        require(msg.value > 0, "Must send HBAR");
        require(_provider != address(0), "Invalid provider");
        require(_deadline > block.timestamp, "Deadline must be future");

        uint256 jobId = nextJobId++;
        jobs[jobId] = Job({
            requester: msg.sender,
            provider: _provider,
            amount: msg.value,
            status: JobStatus.Funded,
            deadline: _deadline
        });

        emit JobCreated(jobId, msg.sender, _provider, msg.value);
        return jobId;
    }

    function completeJob(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.Funded, "Not funded");
        require(msg.sender == job.requester, "Only requester");

        job.status = JobStatus.Completed;
        (bool sent,) = job.provider.call{value: job.amount}("");
        require(sent, "Transfer failed");

        emit JobCompleted(_jobId, job.amount);
    }

    function refundJob(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.Funded, "Not funded");
        require(block.timestamp > job.deadline, "Not expired");
        require(msg.sender == job.requester, "Only requester");

        job.status = JobStatus.Refunded;
        (bool sent,) = job.requester.call{value: job.amount}("");
        require(sent, "Refund failed");

        emit JobRefunded(_jobId);
    }

    function getJob(uint256 _jobId) external view returns (Job memory) {
        return jobs[_jobId];
    }
}
