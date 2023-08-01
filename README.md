# Project Sofritas

This project is a Managed File Transfer service.  It uses AWS Transfer for SFTP.

## Security

AWS Transfer for SFTP is [HIPAA-eligible](https://aws.amazon.com/compliance/hipaa-eligible-services-reference/).  The service supports a wide variety of encryption algorithms with [security policiies](https://docs.aws.amazon.com/transfer/latest/userguide/security-policies.html#cryptographic-algorithms), including [Post-Quantum security policies](https://docs.aws.amazon.com/transfer/latest/userguide/post-quantum-security-policies.html), which are supposed to be resilient to future quantum computers.

AWS frequently uses the [shared responsibility model](https://aws.amazon.com/compliance/shared-responsibility-model/) to help describe where Amazon's management of security begins, and where it ends.  Namely, they are responsible for security *of* the cloud, and we are responsible for security *in* the cloud.

Amazon S3 is our likely domain for the SFTP server, and it has [server-side data encryption](https://docs.aws.amazon.com/transfer/latest/userguide/encryption-at-rest.html) with either Amazon S3 managed keys (SSE-S3) or AWS Key Management Service (AWS KMS) managed keys (SSE-KMS).

If the identity provider is service-managed, then part of our responsibility is [key management](https://docs.aws.amazon.com/transfer/latest/userguide/key-management.html#keyrotation), which includes generating and rotating SSH keys every 3 months, as per recommendation.

Transfer Family includes easy and simple [logging and monitoring](https://docs.aws.amazon.com/transfer/latest/userguide/logging-using-cloudtrail.html#sftp-info-in-cloudtrail), with CloudTrail for architectural changes and CloudWatch Logs for SFTP actions.

Some of the [infrastructure security](https://docs.aws.amazon.com/transfer/latest/userguide/infrastructure-security.html) relevant to this service that all clients must support is the use of TLS 1.2 (at minimum, recommended TLS 1.3) for the Transport-layer security and Cipher suites with perfect forward secrecy.

You can also [secure Transfer Family with WAF and API Gateway](https://aws.amazon.com/blogs/storage/securing-aws-transfer-family-with-aws-web-application-firewall-and-amazon-api-gateway/) to add web ACLs that help protect against attacks.
