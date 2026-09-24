const [version, sha256] = process.argv.slice(2);

if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version ?? '') || !/^[a-f0-9]{64}$/.test(sha256 ?? '')) {
  throw new Error('Usage: node scripts/homebrew-formula.mjs <version> <sha256>');
}

console.log(`class AvanzaTools < Formula
  desc "Command-line interface for Avanza"
  homepage "https://github.com/AnteWall/avanza-ts"
  url "https://registry.npmjs.org/avanza-tools/-/avanza-tools-${version}.tgz"
  sha256 "${sha256}"

  depends_on "node"

  def install
    system "npm", "install", *std_npm_args
    bin.install_symlink libexec.glob("bin/*")
  end

  test do
    assert_match "avanza", shell_output("#{bin}/avanza --help")
  end
end`);
