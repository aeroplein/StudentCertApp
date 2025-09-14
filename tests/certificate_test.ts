import { Clarinet, Tx, Chain, Account, types } from "https://deno.land/x/clarinet@v1.1.0/index.ts";
import { assertEquals } from "std/testing/asserts";







// Test constants
const CONTRACT_NAME = 'certificate';
const ERR_NOT_AUTHORIZED = 100;
const ERR_CERTIFICATE_NOT_FOUND = 101;
const ERR_ALREADY_EXISTS = 102;
const ERR_INVALID_INPUT = 103;
const ERR_INSTITUTION_NOT_REGISTERED = 104;
const ERR_CERTIFICATE_REVOKED = 105;
const ERR_INVALID_RECIPIENT = 106;

Clarinet.test({
  name: "Contract deployment and initialization",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    // Check contract info
    let call = chain.callReadOnlyFn(
      CONTRACT_NAME,
      'get-contract-info',
      [],
      deployer.address
    );
    
    call.result.expectOk();
    const contractInfo = call.result.expectOk().expectTuple();
    assertEquals(contractInfo['total-certificates'], types.uint(0));
    assertEquals(contractInfo['total-institutions'], types.uint(0));
    assertEquals(contractInfo['contract-owner'], deployer.address);
  },
});

Clarinet.test({
  name: "Register institution - success",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const institution = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall(
        CONTRACT_NAME,
        'register-institution',
        [
          types.ascii('Test University'),
          types.principal(institution.address)
        ],
        deployer.address
      )
    ]);
    
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 2);
    
    // Should return institution ID
    block.receipts[0].result.expectOk().expectUint(1);
    
    // Check institution was registered
    let call = chain.callReadOnlyFn(
      CONTRACT_NAME,
      'get-institution',
      [types.uint(1)],
      deployer.address
    );
    
    const institution_data = call.result.expectSome().expectTuple();
    assertEquals(institution_data['name'], types.ascii('Test University'));
    assertEquals(institution_data['address'], institution.address);
    assertEquals(institution_data['is-active'], types.bool(true));
  },
});

Clarinet.test({
  name: "Register institution - unauthorized",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    let block = chain.mineBlock([
      Tx.contractCall(
        CONTRACT_NAME,
        'register-institution',
        [
          types.ascii('Unauthorized University'),
          types.principal(wallet2.address)
        ],
        wallet1.address // Not the deployer
      )
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectErr().expectUint(ERR_NOT_AUTHORIZED);
  },
});

Clarinet.test({
  name: "Register institution - invalid input",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const institution = accounts.get('wallet_1')!;
    
    // Test empty name
    let block = chain.mineBlock([
      Tx.contractCall(
        CONTRACT_NAME,
        'register-institution',
        [
          types.ascii(''), // Empty name
          types.principal(institution.address)
        ],
        deployer.address
      )
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectErr().expectUint(ERR_INVALID_INPUT);
  },
});

Clarinet.test({
  name: "Issue certificate - success",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const institution = accounts.get('wallet_1')!;
    const student = accounts.get('wallet_2')!;
    
    // First register an institution
    let setupBlock = chain.mineBlock([
      Tx.contractCall(
        CONTRACT_NAME,
        'register-institution',
        [
          types.ascii('Test University'),
          types.principal(institution.address)
        ],
        deployer.address
      )
    ]);
    
    setupBlock.receipts[0].result.expectOk().expectUint(1);
    
    // Now issue a certificate
    let block = chain.mineBlock([
      Tx.contractCall(
        CONTRACT_NAME,
        'issue-certificate',
        [
          types.principal(student.address),
          types.uint(1), // institution-id
          types.ascii('Bachelor of Computer Science'),
          types.ascii('This certificate confirms successful completion of Bachelor of Computer Science program.'),
          types.some(types.ascii('https://example.com/metadata.json')),
          types.some(types.ascii('A+'))
        ],
        institution.address
      )
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectOk().expectUint(1); // Certificate ID
    
    // Verify certificate was created
    let call = chain.callReadOnlyFn(
      CONTRACT_NAME,
      'get-certificate',
      [types.uint(1)],
      deployer.address
    );
    
    const cert = call.result.expectSome().expectTuple();
    assertEquals(cert['recipient'], student.address);
    assertEquals(cert['institution-id'], types.uint(1));
    assertEquals(cert['title'], types.ascii('Bachelor of Computer Science'));
    assertEquals(cert['is-revoked'], types.bool(false));
  },
});

Clarinet.test({
  name: "Issue certificate - unauthorized institution",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const institution = accounts.get('wallet_1')!;
    const unauthorized = accounts.get('wallet_2')!;
    const student = accounts.get('wallet_3')!;
    
    // Register institution
    let setupBlock = chain.mineBlock([
      Tx.contractCall(
        CONTRACT_NAME,
        'register-institution',
        [
          types.ascii('Test University'),
          types.principal(institution.address)
        ],
        deployer.address
      )
    ]);
    
    setupBlock.receipts[0].result.expectOk();
    
    // Try to issue certificate from unauthorized address
    let block = chain.mineBlock([
      Tx.contractCall(
        CONTRACT_NAME,
        'issue-certificate',
        [
          types.principal(student.address),
          types.uint(1),
          types.ascii('Fake Certificate'),
          types.ascii('This is unauthorized'),
          types.none(),
          types.none()
        ],
        unauthorized.address
      )
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectErr().expectUint(ERR_NOT_AUTHORIZED);
  },
});

Clarinet.test({
  name: "Issue certificate - invalid recipient (self)",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const institution = accounts.get('wallet_1')!;
    
    // Register institution
    let setupBlock = chain.mineBlock([
      Tx.contractCall(
        CONTRACT_NAME,
        'register-institution',
        [
          types.ascii('Test University'),
          types.principal(institution.address)
        ],
        deployer.address
      )
    ]);
    
    setupBlock.receipts[0].result.expectOk();
    
    // Try to issue certificate to self
    let block = chain.mineBlock([
      Tx.contractCall(
        CONTRACT_NAME,
        'issue-certificate',
        [
          types.principal(institution.address), // Self as recipient
          types.uint(1),
          types.ascii('Self Certificate'),
          types.ascii('This should fail'),
          types.none(),
          types.none()
        ],
        institution.address
      )
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectErr().expectUint(ERR_INVALID_RECIPIENT);
  },
});

Clarinet.test({
  name: "Revoke certificate - success",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const institution = accounts.get('wallet_1')!;
    const student = accounts.get('wallet_2')!;
    
    // Setup: register institution and issue certificate
    let setupBlock = chain.mineBlock([
      Tx.contractCall(
        CONTRACT_NAME,
        'register-institution',
        [
          types.ascii('Test University'),
          types.principal(institution.address)
        ],
        deployer.address
      ),
      Tx.contractCall(
        CONTRACT_NAME,
        'issue-certificate',
        [
          types.principal(student.address),
          types.uint(1),
          types.ascii('Test Certificate'),
          types.ascii('Test description'),
          types.none(),
          types.none()
        ],
        institution.address
      )
    ]);
    
    setupBlock.receipts[0].result.expectOk();
    setupBlock.receipts[1].result.expectOk().expectUint(1);
    
    // Revoke certificate
    let block = chain.mineBlock([
      Tx.contractCall(
        CONTRACT_NAME,
        'revoke-certificate',
        [types.uint(1)],
        institution.address
      )
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectOk().expectBool(true);
    
    // Verify certificate is revoked
    let call = chain.callReadOnlyFn(
      CONTRACT_NAME,
      'get-certificate',
      [types.uint(1)],
      deployer.address
    );
    
    const cert = call.result.expectSome().expectTuple();
    assertEquals(cert['is-revoked'], types.bool(true));
  },
});

Clarinet.test({
  name: "Verify certificate - valid certificate",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const institution = accounts.get('wallet_1')!;
    const student = accounts.get('wallet_2')!;
    
    // Setup: register institution and issue certificate
    let setupBlock = chain.mineBlock([
      Tx.contractCall(
        CONTRACT_NAME,
        'register-institution',
        [
          types.ascii('Test University'),
          types.principal(institution.address)
        ],
        deployer.address
      ),
      Tx.contractCall(
        CONTRACT_NAME,
        'issue-certificate',
        [
          types.principal(student.address),
          types.uint(1),
          types.ascii('Valid Certificate'),
          types.ascii('This certificate is valid'),
          types.none(),
          types.none()
        ],
        institution.address
      )
    ]);
    
    setupBlock.receipts[0].result.expectOk();
    setupBlock.receipts[1].result.expectOk();
    
    // Verify certificate
    let call = chain.callReadOnlyFn(
      CONTRACT_NAME,
      'verify-certificate',
      [types.uint(1)],
      deployer.address
    );
    
    const verification = call.result.expectOk().expectTuple();
    assertEquals(verification['is-valid'], types.bool(true));
    
    const cert = verification['certificate'].expectTuple();
    assertEquals(cert['title'], types.ascii('Valid Certificate'));
    assertEquals(cert['is-revoked'], types.bool(false));
    
    const inst = verification['institution'].expectTuple();
    assertEquals(inst['name'], types.ascii('Test University'));
    assertEquals(inst['is-active'], types.bool(true));
  },
});

Clarinet.test({
  name: "Verify certificate - revoked certificate",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const institution = accounts.get('wallet_1')!;
    const student = accounts.get('wallet_2')!;
    
    // Setup: register institution, issue certificate, then revoke it
    let setupBlock = chain.mineBlock([
      Tx.contractCall(
        CONTRACT_NAME,
        'register-institution',
        [
          types.ascii('Test University'),
          types.principal(institution.address)
        ],
        deployer.address
      ),
      Tx.contractCall(
        CONTRACT_NAME,
        'issue-certificate',
        [
          types.principal(student.address),
          types.uint(1),
          types.ascii('Revoked Certificate'),
          types.ascii('This will be revoked'),
          types.none(),
          types.none()
        ],
        institution.address
      ),
      Tx.contractCall(
        CONTRACT_NAME,
        'revoke-certificate',
        [types.uint(1)],
        institution.address
      )
    ]);
    
    setupBlock.receipts[0].result.expectOk();
    setupBlock.receipts[1].result.expectOk();
    setupBlock.receipts[2].result.expectOk();
    
    // Verify certificate
    let call = chain.callReadOnlyFn(
      CONTRACT_NAME,
      'verify-certificate',
      [types.uint(1)],
      deployer.address
    );
    
    const verification = call.result.expectOk().expectTuple();
    assertEquals(verification['is-valid'], types.bool(false)); // Should be invalid due to revocation
  },
});

Clarinet.test({
  name: "Certificate ownership",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const institution = accounts.get('wallet_1')!;
    const student = accounts.get('wallet_2')!;
    const other = accounts.get('wallet_3')!;
    
    // Setup
    let setupBlock = chain.mineBlock([
      Tx.contractCall(
        CONTRACT_NAME,
        'register-institution',
        [
          types.ascii('Test University'),
          types.principal(institution.address)
        ],
        deployer.address
      ),
      Tx.contractCall(
        CONTRACT_NAME,
        'issue-certificate',
        [
          types.principal(student.address),
          types.uint(1),
          types.ascii('Ownership Test Certificate'),
          types.ascii('Testing ownership'),
          types.none(),
          types.none()
        ],
        institution.address
      )
    ]);
    
    setupBlock.receipts[0].result.expectOk();
    setupBlock.receipts[1].result.expectOk();
    
    // Check ownership
    let ownerCall = chain.callReadOnlyFn(
      CONTRACT_NAME,
      'owns-certificate',
      [types.principal(student.address), types.uint(1)],
      deployer.address
    );
    assertEquals(ownerCall.result, types.bool(true));
    
    let nonOwnerCall = chain.callReadOnlyFn(
      CONTRACT_NAME,
      'owns-certificate',
      [types.principal(other.address), types.uint(1)],
      deployer.address
    );
    assertEquals(nonOwnerCall.result, types.bool(false));
  },
});

Clarinet.test({
  name: "Deactivate institution",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const institution = accounts.get('wallet_1')!;
    
    // Register institution
    let setupBlock = chain.mineBlock([
      Tx.contractCall(
        CONTRACT_NAME,
        'register-institution',
        [
          types.ascii('Test University'),
          types.principal(institution.address)
        ],
        deployer.address
      )
    ]);
    
    setupBlock.receipts[0].result.expectOk();
    
    // Deactivate institution
    let block = chain.mineBlock([
      Tx.contractCall(
        CONTRACT_NAME,
        'deactivate-institution',
        [types.uint(1)],
        deployer.address
      )
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectOk().expectBool(true);
    
    // Check institution status
    let call = chain.callReadOnlyFn(
      CONTRACT_NAME,
      'get-institution',
      [types.uint(1)],
      deployer.address
    );
    
    const inst = call.result.expectSome().expectTuple();
    assertEquals(inst['is-active'], types.bool(false));
  },
});