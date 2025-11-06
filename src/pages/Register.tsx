import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/common/Input";
import authGradient from "@/assets/auth-gradient.png";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, just navigate to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Image */}

      <div className="hidden lg:flex lg:w-1/2 relative self-center overflow-hidden mx-10">
        <div className="relative w-full" style={{ aspectRatio: '1 / 1', height: '80vh' }}>
          <img
            src={authGradient}
            alt="Abstract gradient background"
            className="absolute inset-0 w-full h-full object-cover rounded-2xl"
          />
          <div className="relative z-10 flex items-center justify-center h-full pl-14 pr-28">
            <div className="max-w-md text-white">
              <h1 className="font-heading text-5xl mb-4 font-semibold">
                Sẵn sàng tổ chức hội nghị đầu tiên của bạn?
              </h1>
              <p className="text-base text-white/90 pt-9">
                Tham gia nền tảng quản lý hội nghị, quản lý và kết nối hàng nghìn sự kiện.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full h-screen lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold mb-2">Đăng ký</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Tài khoản"
              type="text"
              placeholder="Nhập tài khoản"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="Nhập email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <div className="relative">
              <Input
                label="Mật khẩu"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-12 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Nhập lại mật khẩu"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-5 top-12 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button type="submit" className="w-full h-11 font-medium">
              Đăng ký
            </Button>
          </form>

          <div className="text-center">
            
           <div className="flex items-center justify-center py-4">
              <hr className="w-1/4"/>
              <p className="text-sm text-muted-foreground px-10">hoặc</p>
              <hr className="w-1/4"/>
            </div>

            <p className="text-sm text-muted-foreground">
              Đăng nhập ngay{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                tại đây
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
