const [version, sha256] = process.argv.slice(2);

if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version ?? '') || !/^[a-f0-9]{64}$/.test(sha256 ?? '')) {
  throw new Error('Usage: node scripts/homebrew-formula.mjs <version> <sha256>');
}

console.log(`class AvanzaTools < Formula
  desc "Command-line interface for Avanza"
  homepage "https://github.com/AnteWall/avanza-ts"
  url "https://github.com/AnteWall/avanza-ts/releases/download/avanza-tools@${version}/avanza-tools-${version}.tgz"
  sha256 "${sha256}"

  depends_on "node"

  def install
    # ponytail: allow same-day SDK releases; pin dependencies if cooldown becomes necessary.
    system "npm", "install", *std_npm_args, "--min-release-age=0"
    bin.install_symlink libexec.glob("bin/*")
  end

  test do
    assert_match "avanza", shell_output("#{bin}/avanza --help")
  end
end`);
