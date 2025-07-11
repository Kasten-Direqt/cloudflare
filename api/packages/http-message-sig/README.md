# http-message-sig

![License](https://img.shields.io/npm/l/http-message-sig.svg)
[![crates.io](https://img.shields.io/npm/v/http-message-sig.svg)][npm]

[npm]: https://www.npmjs.com/package/http-message-sig

HTTP Message Signatures defined by [RFC 9421](https://www.rfc-editor.org/rfc/rfc9421.html).

Forked from [ltonetwork/http-message-signatures](https://github.com/ltonetwork/http-message-signatures).

## Tables of Content

- [Features](#features)
- [Usage](#usage)
- [Security Considerations](#security-considerations)
- [License](#license)

## Features

- HTTP Message Signatures constructions
- Signing synchoronously and asynchronously
- Verifying synchronously and asynchronously
- TypeScript types

## Usage

```typescript
import { sign, verify } from "http-message-sig";
```

## Security Considerations

This software has not been audited. Please use at your sole discretion.

## License

This project is under the Apache-2.0 license.

### Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you shall be Apache-2.0 licensed as above, without any additional terms or conditions.

### Forks

This project is forked from [ltonetwork/http-message-signatures](https://github.com/ltonetwork/http-message-signatures).
It has been forked to allow for customization and extension of the library's functionality.
It is may be rewritten from scratch down the line, as the original project is not fully implementing the RFC.
